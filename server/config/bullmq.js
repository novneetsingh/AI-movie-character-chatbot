const { Queue } = require("bullmq");
const Redis = require("ioredis");

const redisConfig = new Redis(
  {
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  {
    maxRetriesPerRequest: null,
  }
);

// Create a BullMQ queue instance
const chatQueue = new Queue("chatQueue", {
  connection: redisConfig,
});

module.exports = { chatQueue, redisConfig };
