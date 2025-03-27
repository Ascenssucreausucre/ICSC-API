const express = require("express");
const router = express.Router();
const ConferenceController = require("../controllers/ConferenceController");

router.get("/", ConferenceController.getAllConferences);
router.get("/:id", ConferenceController.getConferenceById);
router.post("/", ConferenceController.createConference);

module.exports = router;
