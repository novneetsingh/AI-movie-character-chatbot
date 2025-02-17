const express = require("express");

const router = express.Router();

const {
  createCharacters,
  getChatBotResponse1,
  getChatBotResponse2,
} = require("../controllers/chatController");

// Route to get a dialogue
router.post("/", getChatBotResponse2);

// Route to create dialogues
router.post("/create", createCharacters);

module.exports = router;
