// Import the Pinecone library
const { Pinecone } = require("@pinecone-database/pinecone");

// Initialize a Pinecone client using your API key from the environment
exports.pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
