const { createClient } = require("redis");

exports.redis = async () => {
  try {
    const redisClient = createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    });

    await redisClient.connect();
    console.log("Connected to Redis");
    return redisClient;
  } catch (err) {
    console.error("Error connecting to Redis:", err);
  }
};

//
// await redisClient.set("foo", "bar");
// const result = await redisClient.get("foo");
// console.log(result);
