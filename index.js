const express = require("express");
const app = express();
require("dotenv").config(); // Load environment variables from .env file
const chatRoutes = require("./routes/chatRoutes"); // Import chat routes
const rateLimit = require("express-rate-limit");

// Define port number
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json()); // Parse JSON requests

// Apply rate limiting middleware for all routes with a limit of 5 requests per second per IP
app.use(
  rateLimit({
    windowMs: 1000, // 1 second window
    max: 5, // Limit each IP to 5 requests per second
    message: { error: "Too many requests, please try again later." },
  })
);

// Connect to database and cloudinary
require("./config/database").dbconnect(); // Connect to database

// run this function to create vector embeddings for characters and store them in pinecone
//require("./utils/createVectorEmbeddings").indexCharacterEmbeddings();

// start the bullmq worker
// require("./utils/chatWorker").startWorker();


// Route setup
app.use("/chat", chatRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("<h1>Hello Hi Bye</h1>"); // Simple response for root route
});

// Activate server
app.listen(PORT, () => {
  console.log("Server is running on port", PORT); // Log server activation
});
