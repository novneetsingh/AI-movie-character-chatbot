import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL);

const App = () => {
  const [character, setCharacter] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    socket.on("chatbotResponse", (data) => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", message: data.response },
      ]);
    });

    return () => {
      socket.off("chatbotResponse");
    };
  }, []);

  const handleSendMessage = () => {
    if (!character || !userMessage) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", message: userMessage },
    ]);

    socket.emit("chatbotMessage", { character, user_message: userMessage });

    // Clear input fields
    setUserMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          🎬 AI Movie Chatbot
        </h1>

        {/* Chat Messages */}
        <div className="mb-4 h-64 overflow-y-auto border border-gray-600 p-3 rounded-md bg-gray-700">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-md ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white text-right"
                  : "bg-gray-600 text-white"
              }`}
            >
              <strong>{msg.sender === "user" ? "You" : "AI"}:</strong>{" "}
              {msg.message}
            </div>
          ))}
        </div>

        {/* Character Input */}
        <input
          type="text"
          placeholder="Enter Character Name"
          className="w-full p-2 mb-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none"
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
        />

        {/* Question Input */}
        <input
          type="text"
          placeholder="Ask a question..."
          className="w-full p-2 mb-4 rounded-md bg-gray-700 border border-gray-600 focus:outline-none"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition"
        >
          Ask AI
        </button>
      </div>
    </div>
  );
};

export default App;
