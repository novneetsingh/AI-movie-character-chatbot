const { Worker } = require("bullmq");
const { redisConfig } = require("../config/bullmq");
const { generateGeminiResponse } = require("./generateGeminiResponse");
const { queryPinecone } = require("./queryPinecone");
const redisClient = require("../config/redis").redisConnect();
const io = require("./socket").getIO();

exports.startWorker = () => {
  const worker = new Worker(
    "chatQueue",
    async (job) => {
      const { character, user_message, socketId } = job.data;

      character = character.toLowerCase();
      user_message = user_message.toLowerCase();

      // create cache key for redis
      const cacheKey = `chatbot_response_${character}_${user_message}`;

      // Check if the response is already in the Redis cache
      const cachedResponse = await redisClient.get(cacheKey);
      // If the response is found in the cache, return it
      if (cachedResponse) {
        return { response: cachedResponse, socketId };
      }

      // If the response is not found in the cache, proceed with generating the response
      const pineconeResponse = await queryPinecone(
        character + " " + user_message
      );

      let retrievedContext = "";

      // If Pinecone response contains matches, join them into a single string if the name matches character
      if (pineconeResponse && pineconeResponse.matches.length > 0) {
        pineconeResponse.matches.forEach((match) => {
          if (match.metadata.name === character) {
            retrievedContext += match.text;
          }
        });
      }

      let fullPrompt;

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

      // Store the response in the Redis cache for 1 minutes
      await redisClient.setEx(cacheKey, 60, chatBotResponse);

      return { response: chatBotResponse, socketId };
    },
    { connection: redisConfig, concurrency: 10 }
  );

  // Handle job completion event and emit response to socket client
  worker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed`);

    io.to(result.socketId).emit("chatbotResponse", {
      response: result.response,
    });
  });

  // Handle job failure event and emit error message to socket client
  worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);

    io.to(job.data.socketId).emit("error", {
      message: "Failed to process your message",
    });
  });

  console.log(`BullMQ Worker started`);
};
