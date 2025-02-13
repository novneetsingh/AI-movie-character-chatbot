const Character = require("../models/Character");
const { iconicCharacters } = require("../utils/charactersData");
const { genAI } = require("../config/genAI"); // Import the configured Gemini instance
const { queryPinecone } = require("../utils/queryPinecone"); // Import the Pinecone query function

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

// Controller to get a chatbot response (upto Level 2)
// exports.getChatBotResponse = async (req, res) => {
//   try {
//     let { character, user_message } = req.body;

//     if (!character || !user_message) {
//       return res
//         .status(400)
//         .json({ error: "Character and user message are required" });
//     }

//     // Convert inputs to lowercase for consistency
//     character = character.toLowerCase();
//     user_message = user_message.toLowerCase();

//     // Find the character in the database
//     const movieCharacter = await Character.findOne({ name: character });

//     if (movieCharacter) {
//       // Get stored dialogues for the character
//       const characterDialogues = movieCharacter.dialogues;

//       // Look for an exact or similar dialogue that includes the user message
//       const matchedDialogue = characterDialogues.find((dialogue) =>
//         dialogue.includes(user_message)
//       );

//       if (matchedDialogue) {
//         return res.json({ response: matchedDialogue });
//       }

//       // If no matching dialogue is found, use personality as a fallback to generate a response
//       if (movieCharacter.personality) {
//         const chatBotResponse = await generateAIResponse(
//           movieCharacter.name,
//           movieCharacter.personality,
//           user_message
//         );
//         return res.json({ response: chatBotResponse });
//       }
//     }

//     // If character is not found, generate an AI response using a default prompt
//     const chatBotResponse = await generateAIResponse(
//       character,
//       "you are a movie character",
//       user_message
//     );
//     return res.json({ response: chatBotResponse });
//   } catch (error) {
//     console.error("Error fetching dialogues:", error);
//     res.status(500).json({ error: "Error fetching dialogues" });
//   }
// };

// Function to generate an AI response using the Google Generative AI (Gemini) API
// const generateAIResponse = async (name, personality, user_message) => {
//   try {
//     // Get the Gemini model instance (adjust model name if needed)
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.0-flash-lite-preview-02-05",
//     });

//     // Combine the personality and user message into a full prompt with instructions
//     const fullPrompt = `You are ${name}, a movie character from Indian cinema with the following personality: ${personality}.
// User: ${user_message}
// Reply in one single, concise sentence, using your signature tone. Limit your response to a maximum of 25 words.`;

//     // Generate content using the Gemini model with a limit on the output tokens
//     const result = await model.generateContent(fullPrompt);
//     // Return the generated text response after trimming extra whitespace/newlines
//     return result.response.text().trim();
//   } catch (error) {
//     console.error("Error generating AI response:", error);
//     return "I am unable to respond at the moment. Please try again later.";
//   }
// };

// Controller to get a chatbot response (Level 3)
exports.getChatBotResponse = async (req, res) => {
  try {
    let { character, user_message } = req.body;
    if (!character || !user_message) {
      return res
        .status(400)
        .json({ error: "Character and user message are required" });
    }

    character = character.toLowerCase();
    user_message = user_message.toLowerCase();

    // Query Pinecone for similar dialogue context based on the user query
    const pineconeResponse = await queryPinecone(
      character + " " + user_message
    );

    let retrievedContext = "";

    // If Pinecone response contains matches, join them into a single string if the name matches character
    if (pineconeResponse && pineconeResponse.matches.length > 0) {
      const matches = pineconeResponse.matches;
      matches.forEach((match) => {
        if (match.metadata.name === character) {
          retrievedContext += match.text;
        }
      });
    }

    // Build a complete prompt using character details, retrieved context, and the user query
    let fullPrompt;

    // check that this character is in pinecone db or not using pinecone metadata if not then make another prompt for this character
    if (character === pineconeResponse.matches[0].metadata.name) {
      fullPrompt = `You are ${character}, a movie character from Indian cinema.
${
  retrievedContext ? "Relevant past dialogues:\n" + retrievedContext + "\n" : ""
}
User: ${user_message}
Provide a single, concise response in your signature tone. Limit your answer to a maximum of 15 words.`;
    } else {
      // if character is not in pinecone db then make another prompt
      fullPrompt = `You are ${character}, a movie character from Indian cinema.
User: ${user_message}
Provide a single, concise response in your signature tone. Limit your answer to a maximum of 15 words.`;
    }

    // Generate the final response using the Gemini AI
    const chatBotResponse = await generateGeminiResponse(fullPrompt);

    return res.json({ response: chatBotResponse });
  } catch (error) {
    console.error("Error fetching dialogues:", error);
    return res.status(500).json({ error: "Error fetching dialogues" });
  }
};

// Separate function to generate a Gemini AI response
const generateGeminiResponse = async (prompt) => {
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
