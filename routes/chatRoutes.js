const express = require("express");

const router = express.Router();

const {
  getChatBotResponse,
  createCharacters,
} = require("../controllers/chatController");

// Route to get a dialogue
router.post("/", getChatBotResponse);

// Route to create dialogues
router.post("/create", createCharacters);

module.exports = router;
