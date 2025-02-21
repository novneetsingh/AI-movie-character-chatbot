const { Worker } = require("bullmq");
const { redisConfig } = require("../config/bullmq");
const { generateGeminiResponse } = require("./generateGeminiResponse");
const { queryPinecone } = require("./queryPinecone");
const { redisClient } = require("../config/redis");
const io = require("./socket").getIO();

exports.startWorker = () => {
  new Worker(
    "chatQueue",
    async (job) => {
      let { character, user_message, socketId } = job.data;
      character = character.toLowerCase();
      user_message = user_message.toLowerCase();

      // Create cache key for Redis history
      const cacheKey = `chatbot_history_${socketId}_${character}`;

      // Execute Redis & Pinecone in parallel
      const [cachedHistoryString, pineconeResponse] = await Promise.all([
        redisClient.get(cacheKey), // Get cached chat history as string
        queryPinecone(`${character} ${user_message}`), // Query Pinecone
      ]);

      // Parse history from Redis or initialize an empty array
      let history = cachedHistoryString ? JSON.parse(cachedHistoryString) : [];

      // Format chat history for the prompt (if any)
      const formattedHistory = history
        .map((entry) => `User: ${entry.user}\nAI: ${entry.response}`)
        .join("\n");

      // Build the prompt including history
      let fullPrompt = `You are ${character}, a movie character.
${formattedHistory ? `\nPrevious chat history:\n${formattedHistory}\n` : ""}
User: ${user_message}
Provide a single, concise response. Limit your response to a maximum of 15 words.`;

      // Update prompt with Pinecone data if available and matching the character
      if (pineconeResponse?.matches?.length > 0) {
        const match = pineconeResponse.matches[0];
        if (match.metadata.name === character) {
          fullPrompt = `You are ${character}, a movie character from the movie: ${
            match.metadata.movie
          }.
Relevant past dialogues: ${match.metadata.dialogue}
having personality traits: ${match.metadata.personality}\n
${formattedHistory ? `Previous chat history:\n${formattedHistory}\n` : ""}
User: ${user_message}
Provide a single, concise response in your signature tone. Limit your response to a maximum of 15 words.`;
        }
      }

      // Generate AI response using Gemini and accumulate full response
      const geminiResponse = await generateGeminiResponse(fullPrompt);

      for await (const chunk of geminiResponse) {
        await new Promise((resolve) => {
          setTimeout(() => {
            io.to(socketId).emit("chatbotResponse", { response: chunk });
            resolve();
          }, 30);
        });
      }

      // Notify frontend that response is complete
      io.to(socketId).emit("chatbotResponseEnd");

      // Append new Q&A pair to history
      history.push({ user: user_message, response: geminiResponse });

      // Update Redis with new history and set TTL to 5 minutes (300 seconds)
      await redisClient.setEx(cacheKey, 300, JSON.stringify(history));
    },
    { connection: redisConfig, concurrency: 10 }
  );

  console.log(`BullMQ Worker started`);
};
