const { Server } = require("socket.io");
const { chatQueue } = require("../config/bullmq");

let io;

exports.initializeSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("chatbotMessage", async (data) => {
      try {
        const { character, user_message } = data;

        if (!character || !user_message) {
          socket.emit("error", {
            message: "Character and user message are required",
          });
          return;
        }

        // Add job to queue
        const job = await chatQueue.add(
          "chatbotJob",
          { character, user_message, socketId: socket.id },
          {
            removeOnComplete: true,
            removeOnFail: true,
          }
        );

        // console.log(`Job added to queue: ${job.id}`);
      } catch (error) {
        console.error("Error:", error);
        socket.emit("error", { message: "Error processing your request" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

exports.getIO = () => io;
