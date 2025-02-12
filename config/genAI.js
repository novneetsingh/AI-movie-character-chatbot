// config/genAI.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in your environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

module.exports = genAI;
