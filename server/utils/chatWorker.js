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

      // create cache key for redis
      const cacheKey = `chatbot_response_${character}_${user_message}`;

      // **Execute Redis & Pinecone in Parallel**
      const [cachedResponse, pineconeResponse] = await Promise.all([
        redisClient.get(cacheKey), // Check Redis cache
        queryPinecone(character + " " + user_message), // Query Pinecone
      ]);

      // If the response is found in the cache, return it
      if (cachedResponse) {
        io.to(socketId).emit("chatbotResponse", { response: cachedResponse });

        // Notify the frontend that the response is complete
        io.to(socketId).emit("chatbotResponseEnd");
        return;
      }

      // Build a complete prompt using character details, retrieved context, and the user query
      let fullPrompt = `You are ${character}, a movie character.
      User: ${user_message}
      Provide a single, concise response. Limit your response to a maximum of 15 words.`;

      // If Pinecone response contains matches, join them into a single string if the name matches character
      if (pineconeResponse?.matches?.length > 0) {
        const matches = pineconeResponse.matches;

        if (matches[0].metadata.name === character) {
          fullPrompt = `You are ${character}, a movie character from movie name: ${matches[0].metadata.movie}.
          Relevant past dialogue: ${matches[0].metadata.dialogue},
          having personality traits: ${matches[0].metadata.personality}.
          User: ${user_message}
          Provide a single, concise response in your signature tone. Limit your response to a maximum of 15 words.`;
        }
      }

      // Generate AI response using Gemini
      const chatBotResponse = await generateGeminiResponse(fullPrompt);

      // emit response in chunks to socket client
      for await (const chunk of chatBotResponse) {
        await new Promise((resolve) => {
          setTimeout(() => {
            io.to(socketId).emit("chatbotResponse", { response: chunk });
            resolve(); // Only after this, the loop moves to the next iteration
          }, 30); // Set the delay to 30ms
        });
      }

      // Notify the frontend that the response is complete
      io.to(socketId).emit("chatbotResponseEnd");

      // Set the response in the Redis cache
      await redisClient.setEx(cacheKey, 60, chatBotResponse);
    },
    { connection: redisConfig, concurrency: 10 }
  );

  console.log(`BullMQ Worker started`);
};
