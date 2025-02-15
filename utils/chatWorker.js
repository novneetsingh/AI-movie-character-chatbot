const { redisConfig } = require("../config/bullmq");
const { Worker } = require("bullmq");
const { generateGeminiResponse } = require("./generateGeminiResponse");
const { queryPinecone } = require("./queryPinecone");
const { redisConnect } = require("../config/redis");

const redisClient = redisConnect();

exports.startWorker = () => {
  // Create a worker that processes jobs from "chatQueue"
  const worker = new Worker(
    "chatQueue",
    async (job) => {
      const { character, user_message } = job.data;

      // Create cache key for redis
      const cacheKey = `chatbot_response_${character}_${user_message}`;

      // Check if the response is already in the Redis cache
      const cachedResponse = await redisClient.get(cacheKey);

      if (cachedResponse) {
        return cachedResponse;
      }

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

      // Check if this character is in pinecone db or not using pinecone metadata
      if (
        pineconeResponse.matches.length > 0 &&
        character === pineconeResponse.matches[0].metadata.name
      ) {
        fullPrompt = `You are ${character}, a movie character from movie name: ${pineconeResponse.matches[0].metadata.movie}.
          Relevant past dialogues: ${retrievedContext}
          User: ${user_message}
          Provide a single, concise response in your signature tone. Limit your answer to a maximum of 15 words.`;
      } else {
        fullPrompt = `You are ${character}, a movie character.
          User: ${user_message}
          Provide a single, concise response in your signature tone. Limit your answer to a maximum of 15 words.`;
      }

      // Generate AI response using Gemini
      const chatBotResponse = await generateGeminiResponse(fullPrompt);

      // Store the response in the Redis cache for 1 minute
      await redisClient.setEx(cacheKey, 60, chatBotResponse);

      return chatBotResponse;
    },
    { connection: redisConfig, concurrency: 1 }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed: ${job.returnvalue}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
  });

  console.log("BullMQ Worker started...");
};
