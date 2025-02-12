const mongoose = require("mongoose");

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  movie: {
    type: String,
    required: true,
    lowercase: true,
  },
  personality: {
    type: String,
    required: true, // Helps generate AI responses if no dialogue matches
  },
  dialogues: [
    {
      type: String,
      lowercase: true,
    },
  ],
});

module.exports = mongoose.model("Character", characterSchema);
