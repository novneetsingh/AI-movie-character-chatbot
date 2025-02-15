const { Queue } = require("bullmq");
const Redis = require("ioredis");

const redisConfig = new Redis(
  {
    host: "localhost",
    port: 6379,
  },
  {
    maxRetriesPerRequest: null,
  }
);

// Create a BullMQ queue instance
const chatQueue = new Queue("chatQueue", {
  connection: redisConfig,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
});

module.exports = { chatQueue, redisConfig };
