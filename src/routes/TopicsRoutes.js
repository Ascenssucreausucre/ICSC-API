const express = require("express");
const router = express.Router();
const TopicController = require("../controllers/TopicController.js");
const getCurrentConference = require("../middleware/getCurrentConference.js");
const authenticateAdmin = require("../middleware/authenticateAdmin.js");

router.get("/", TopicController.getAllTopicsWithContent);
router.get(
  "/current",
  getCurrentConference,
  TopicController.getCurrentTopicsWithContent
);
router.post(
  "/create/",
  authenticateAdmin,
  getCurrentConference,
  TopicController.createTopicWithContent
);
router.put(
  "/update/:id",
  authenticateAdmin,
  TopicController.updateTopicWithContent
);
router.delete("/delete/:id", authenticateAdmin, TopicController.deleteTopic);

module.exports = router;
