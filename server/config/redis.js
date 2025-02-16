const { createClient } = require("redis");

exports.redisConnect = () => {
  try {
    const redisClient = createClient();
    redisClient.connect();
    console.log("Connected to Redis");
    return redisClient;
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    process.exit(1);
  }
};
