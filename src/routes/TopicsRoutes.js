const express = require("express");
const router = express.Router();
const TopicController = require("../controllers/TopicController.js");
const getCurrentConference = require("../middleware/getCurrentConference.js");
const { authenticateAdmin } = require("../middleware/authenticateAdmin.js");
const {
  verifyTopicWithContent,
  handleValidationErrors,
} = require("../middleware/validators.js");

router.get("/", TopicController.getAllTopicsWithContent);
router.get(
  "/current",
  getCurrentConference,
  TopicController.getCurrentTopicsWithContent
);
router.post(
  "/create/",
  authenticateAdmin,
  verifyTopicWithContent,
  handleValidationErrors,
  TopicController.createTopicWithContent
);
router.put(
  "/update/:id",
  authenticateAdmin,
  verifyTopicWithContent,
  handleValidationErrors,
  TopicController.updateTopicWithContent
);
router.delete("/delete/:id", authenticateAdmin, TopicController.deleteTopic);

module.exports = router;
