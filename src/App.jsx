import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

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

    setUserMessage(""); // Clear input
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      {/* Chat Container */}
      <motion.div
        className="w-full max-w-2xl p-6 rounded-xl bg-opacity-20 backdrop-blur-lg shadow-lg border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center text-blue-400 pb-4">
          🎬 AI Movie Chatbot
        </h1>

        {/* Chat Messages */}
        <div className="mb-4 h-72 overflow-y-auto border border-gray-600 p-4 rounded-lg bg-gray-800 bg-opacity-40 space-y-2">
          {chatMessages.map((msg, index) => (
            <motion.div
              key={index}
              className={`p-2 rounded-lg max-w-4/5 ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end text-right ml-auto"
                  : "bg-gray-600 text-white text-left mr-auto"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <strong>{msg.sender === "user" ? "🧑‍💻 You" : "🤖 AI"}</strong>
              <p>{msg.message}</p>
            </motion.div>
          ))}
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
        <motion.button
          onClick={handleSendMessage}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg transition transform hover:scale-105"
          whileTap={{ scale: 0.9 }}
        >
          🚀 Ask AI
        </motion.button>
      </motion.div>
    </div>
  );
};

export default App;
