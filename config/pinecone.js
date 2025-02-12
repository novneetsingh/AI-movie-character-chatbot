const { Pinecone } = require("@pinecone-database/pinecone");

exports.pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
//   environment: process.env.PINECONE_ENVIRONMENT,
});
