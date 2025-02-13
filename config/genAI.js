const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
