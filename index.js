const express = require("express");
const app = express();
require("dotenv").config(); // Load environment variables from .env file
const chatRoutes = require("./routes/chatRoutes"); // Import chat routes

// Define port number
const PORT = process.env.PORT || 4000;

// Middleware setup
app.use(express.json()); // Parse JSON requests

// Connect to database and cloudinary
require("./config/database").dbconnect(); // Connect to database

// run this function to create vector embeddings for characters and store them in pinecone
// require("./utils/createVectorEmbeddings").indexCharacterEmbeddings();

require("./config/redis").redis();


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
