import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL);

const App = () => {
  const [character, setCharacter] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [currentBotMessage, setCurrentBotMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Typing Indicator

  useEffect(() => {
    socket.on("chatbotResponse", (data) => {
      setIsTyping(false); // Stop typing indicator when response starts
      setCurrentBotMessage((prev) => prev + data.response); // Append streamed response
    });

    socket.on("chatbotResponseEnd", () => {
      if (currentBotMessage.trim()) {
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot", message: currentBotMessage },
        ]);
        setCurrentBotMessage(""); // Reset message for next interaction
      }
    });

    return () => {
      socket.off("chatbotResponse");
      socket.off("chatbotResponseEnd");
    };
  }, [currentBotMessage]);

  const handleSendMessage = () => {
    if (!character || !userMessage) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", message: userMessage },
    ]);

    setIsTyping(true); // Show typing indicator
    socket.emit("chatbotMessage", { character, user_message: userMessage });

    setUserMessage(""); // Clear input
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="w-full max-w-2xl p-6 rounded-xl bg-gray-800 shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-center text-blue-400 pb-4">
          🎬 AI Movie Chatbot
        </h1>

        {/* Chat Messages */}
        <div className="mb-4 h-72 overflow-y-auto border border-gray-600 p-4 rounded-lg bg-gray-900 space-y-3">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-4/5 ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end text-right ml-auto"
                  : "bg-gray-700 text-white text-left mr-auto"
              }`}
            >
              <strong>{msg.sender === "user" ? "🧑‍💻 You" : "🤖 AI"}</strong>
              <p>{msg.message}</p>
            </div>
          ))}

          {/* Current Bot Message */}
          {currentBotMessage && (
            <div className="p-3 rounded-lg max-w-4/5 bg-gray-700 text-white text-left mr-auto">
              <strong>🤖 AI:</strong> {currentBotMessage}
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="p-3 rounded-lg max-w-4/5 bg-gray-700 text-white text-left mr-auto flex items-center">
              <strong>🤖 AI:</strong>
              <span className="ml-2 animate-pulse">⌛ Typing...</span>
            </div>
          )}
        </div>

        {/* Input Fields */}
        <input
          type="text"
          placeholder="Enter Character Name..."
          className="w-full p-3 mb-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
        />

        <input
          type="text"
          placeholder="Ask a question..."
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg transition transform hover:scale-105"
        >
          🚀 Ask AI
        </button>
      </div>
    </div>
  );
};

export default App;
