const Character = require("../models/Character");
const { iconicCharacters } = require("../utils/charactersData");
const genAI = require("../config/genAI"); // Import the configured Gemini instance

// Create characters in the database
exports.createCharacters = async (req, res) => {
  try {
    await Character.insertMany(iconicCharacters);
    res.json({ message: "Characters created successfully" });
  } catch (error) {
    console.error("Error creating characters:", error);
    res.status(500).json({ error: "Error creating characters" });
  }
};

// Get response from chatbot
exports.getChatBotResponse = async (req, res) => {
  try {
    let { character, user_message } = req.body;

    if (!character || !user_message) {
      return res
        .status(400)
        .json({ error: "Character and user message are required" });
    }

    // Convert inputs to lowercase for consistency
    character = character.toLowerCase();
    user_message = user_message.toLowerCase();

    // Find the character in the database
    const movieCharacter = await Character.findOne({ name: character });

    if (movieCharacter) {
      // Get stored dialogues for the character
      const characterDialogues = movieCharacter.dialogues;

      // Look for an exact or similar dialogue that includes the user message
      const matchedDialogue = characterDialogues.find((dialogue) =>
        dialogue.includes(user_message)
      );

      if (matchedDialogue) {
        return res.json({ response: matchedDialogue });
      }

      // If no matching dialogue is found, use personality as a fallback to generate a response
      if (movieCharacter.personality) {
        const chatBotResponse = await generateAIResponse(
          movieCharacter.name,
          movieCharacter.personality,
          user_message
        );
        return res.json({ response: chatBotResponse });
      }
    }

    // If character is not found, generate an AI response using a default prompt
    const chatBotResponse = await generateAIResponse(
      character,
      "you are a movie character",
      user_message
    );
    return res.json({ response: chatBotResponse });
  } catch (error) {
    console.error("Error fetching dialogues:", error);
    res.status(500).json({ error: "Error fetching dialogues" });
  }
};

// Function to generate an AI response using the Google Generative AI (Gemini) API
const generateAIResponse = async (name, personality, user_message) => {
  try {
    // Get the Gemini model instance (adjust model name if needed)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
    });

    // Combine the personality and user message into a full prompt with instructions
    const fullPrompt = `You are ${name}, a movie character from Indian cinema with the following personality: ${personality}.
User: ${user_message}
Reply in one single, concise sentence, using your signature tone. Limit your response to a maximum of 25 words.`;

    // Generate content using the Gemini model with a limit on the output tokens
    const result = await model.generateContent(fullPrompt);
    // Return the generated text response after trimming extra whitespace/newlines
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I am unable to respond at the moment. Please try again later.";
  }
};
