const express = require("express");
const router = express.Router();
const ConversationController = require("../controllers/ConversationController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const { authenticateAny } = require("../middleware/authenticateAny");

router.get(
  "/user/conversation",
  authenticateAny,
  ConversationController.getUserConversation
);
router.get(
  "/conversations",
  authenticateAdmin,
  ConversationController.getAdminConversations
);
router.get(
  "/conversations/:id",
  authenticateAdmin,
  ConversationController.getConversation
);
router.post(
  "/conversation/send-message/:id",
  authenticateAny,
  ConversationController.sendMessage
);
router.put(
  "/conversation/archive/:conversationId",
  authenticateAdmin,
  ConversationController.archiveConversation
);
router.put(
  "/conversation/toggle-throttling/:conversationId",
  authenticateAdmin,
  ConversationController.toggleThrottling
);
router.delete(
  "/conversations/archived",
  authenticateAdmin,
  ConversationController.deleteArchivedConversations
);
router.delete(
  "/conversations/:id",
  authenticateAdmin,
  ConversationController.deleteConversation
);

module.exports = router;
