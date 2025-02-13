const { pc } = require("../config/pinecone");

exports.queryPinecone = async (query) => {
  try {
    // Define the embedding model you wish to use.
    // Adjust this model name to match the one used when indexing your data.
    const model = "multilingual-e5-large";

    // Wrap the query string in an array (as required by the embed method)
    const queryArray = [query];

    // Generate an embedding for the query.
    // The embed method returns an array of embeddings corresponding to the input queries.
    const queryEmbeddingResponse = await pc.inference.embed(model, queryArray, {
      inputType: "query",
    });

    // Extract the embedding vector from the response.
    const queryEmbedding = queryEmbeddingResponse[0].values;

    // Retrieve the Pinecone index where your vectors are stored.
    // Replace 'quickstart' with your actual index name.
    const index = pc.index(process.env.PINECONE_INDEX_NAME);

    // Query the index under the specified namespace.
    // 'topK' is the number of closest vectors to retrieve.
    // 'includeMetadata: true' returns any metadata stored with each vector.
    const queryResponse = await index
      .namespace(process.env.PINECONE_NAMESPACE)
      .query({
        topK: 3,
        vector: queryEmbedding,
        includeValues: false,
        includeMetadata: true,
      });

    // console.log("Query response:", queryResponse);

    return queryResponse;
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    throw error;
  }
};
