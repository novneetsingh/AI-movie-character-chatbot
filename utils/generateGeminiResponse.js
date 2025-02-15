const { genAI } = require("../config/genAI");

// Separate function to generate a Gemini AI response
exports.generateGeminiResponse = async (prompt) => {
  try {
    // Get the Gemini model instance (adjust model name as needed)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
    });

    // Generate content using the provided prompt and a token limit
    const result = await model.generateContent(prompt);

    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating Gemini response:", error);
    return "I am unable to respond at the moment. Please try again later.";
  }
};
