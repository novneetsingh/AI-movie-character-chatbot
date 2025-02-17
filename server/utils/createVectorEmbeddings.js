const Character = require("../models/Character");
const { pc } = require("../config/pinecone");

/**
 * Fetches all character documents from MongoDB, prepares a data array by extracting dialogues,
 * generates vector embeddings for each dialogue using Pinecone's embedding inference,
 * and upserts these embeddings (with metadata) into a Pinecone index.
 *
 * Note: The embedding generation only uses the text field.
 *       The metadata is added only during the upsert to provide extra context.
 */

exports.indexCharacterEmbeddings = async () => {
  try {
    // Fetch all characters from MongoDB
    let characters = await Character.find().exec();

    // Prepare a data array: each dialogue becomes an object with a unique ID, text, and metadata.
    const data = [];

    characters.forEach((char) => {
      char.dialogues.forEach((dialogue, index) => {
        data.push({
          id: `${char._id}-${index}`, // Create a unique ID for each dialogue
          text: `${char.name}: ${dialogue}`, // Text to be embedded
          metadata: {
            name: char.name,
            movie: char.movie,
            dialogue: dialogue,
            personality: char.personality,
          },
        });
      });
    });

    // console.log("Prepared data for embeddings:", data);

    // Define the embedding model (replace with your desired model if needed)
    const model = "multilingual-e5-large";

    // Generate embeddings using only the text from each dialogue.
    // Metadata is not used in this embedding step.
    const embeddingsResponse = await pc.inference.embed(
      model,
      data.map((d) => d.text),
      { inputType: "passage", truncate: "END" }
    );

    // embeddingsResponse should be an array with an embedding corresponding to each text.
    // console.log("Generated embeddings:", embeddingsResponse);

    // Target the index where you'll store the vector embeddings.
    // Replace 'quickstart' with your actual index name if different.
    const index = pc.index(process.env.PINECONE_INDEX_NAME);

    // Prepare the records for upsert:
    // Each record includes an 'id', the embedding 'values', and metadata (for context).
    const records = data.map((d, i) => ({
      id: d.id,
      values: embeddingsResponse[i].values, // Ensure your embeddings have a 'values' field
      metadata: d.metadata,
    }));

    // Upsert the vectors into the index under a specific namespace (e.g., 'example-namespace')
    await index.namespace(process.env.PINECONE_NAMESPACE).upsert(records);

    console.log(
      `Successfully indexed ${records.length} vectors into the '${process.env.PINECONE_INDEX_NAME}' index under namespace '${process.env.PINECONE_NAMESPACE}'.`
    );
  } catch (error) {
    console.error("Error indexing character embeddings:", error);
    throw error;
  }
};
