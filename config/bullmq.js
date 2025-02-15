const { Queue } = require("bullmq");
const Redis = require("ioredis");

const redisConfig = new Redis({
  host: "localhost",
  port: 6379,
});

// Create a BullMQ queue instance
const chatQueue = new Queue("chatQueue", { connection: redisConfig });

console.log("Chat queue created");

module.exports = { chatQueue, redisConfig };
