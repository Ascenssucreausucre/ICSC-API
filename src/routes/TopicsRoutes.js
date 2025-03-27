const express = require("express");
const router = express.Router();
const TopicController = require("../controllers/TopicController.js");

router.get("/", TopicController.getAllTopicsWithContent);
router.post("/create/", TopicController.createTopicWithContent);
router.put("/update/:id", TopicController.updateTopicWithContent);
router.delete("/delete/:id", TopicController.deleteTopic);

module.exports = router;
