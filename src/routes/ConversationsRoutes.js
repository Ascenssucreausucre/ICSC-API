const express = require("express");
const router = express.Router();
const ConversationController = require("../controllers/ConversationController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const { authenticateAny } = require("../middleware/authenticateAny");
const {
  verifyMessage,
  handleValidationErrors,
} = require("../middleware/validators");

router.get(
  "/user/",
  authenticateAny,
  ConversationController.getUserConversation
);
router.get(
  "/",
  authenticateAdmin,
  ConversationController.getAdminConversations
);
router.get("/:id", authenticateAdmin, ConversationController.getConversation);
router.post(
  "/send-message/:id",
  verifyMessage,
  handleValidationErrors,
  authenticateAny,
  ConversationController.sendMessage
);
router.put(
  "/archive/:conversationId",
  authenticateAdmin,
  ConversationController.archiveConversation
);
router.put(
  "/toggle-throttling/:conversationId",
  authenticateAdmin,
  ConversationController.toggleThrottling
);
router.delete(
  "/archived",
  authenticateAdmin,
  ConversationController.deleteArchivedConversations
);
router.delete(
  "/:id",
  authenticateAdmin,
  ConversationController.deleteConversation
);

module.exports = router;
