const { Worker } = require("bullmq");
const { redisConfig } = require("../config/bullmq");
const { generateGeminiResponse } = require("./generateGeminiResponse");
const { queryPinecone } = require("./queryPinecone");
const { redisClient } = require("../config/redis");
const io = require("./socket").getIO();

exports.startWorker = () => {
  const worker = new Worker(
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
        return { response: cachedResponse, socketId };
      }

      // Build a complete prompt using character details, retrieved context, and the user query
      let fullPrompt = `You are ${character}, a movie character.
      User: ${user_message}
      Provide a single, concise response. Limit your response to a maximum of 15 words.`;

      // If Pinecone response contains matches, join them into a single string if the name matches character
      if (pineconeResponse && pineconeResponse.matches.length > 0) {
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

      // Store the response in the Redis cache for 1 minutes
      await redisClient.setEx(cacheKey, 60, chatBotResponse);

      return { response: chatBotResponse, socketId };
    },
    { connection: redisConfig, concurrency: 10 }
  );

  // Handle job completion event and emit response to socket client
  worker.on("completed", (job, result) => {
    // console.log(`Job ${job.id} completed`);

    io.to(result.socketId).emit("chatbotResponse", {
      response: result.response,
    });
  });

  // Handle job failure event and emit error message to socket client
  worker.on("failed", (job, err) => {
    // console.error(`Job ${job.id} failed: ${err.message}`);

    io.to(job.data.socketId).emit("error", {
      message: "Failed to process your message",
    });
  });

  console.log(`BullMQ Worker started`);
};
