const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/ContactController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  verifyContact,
  handleValidationErrors,
} = require("../middleware/validators");

router.get("/", authenticateAdmin, ContactController.getAll);
router.get("/:id", authenticateAdmin, ContactController.getOne);
router.get(
  "/conference/:conference_id",
  authenticateAdmin,
  ContactController.getByConference
);

router.post(
  "/",
  authenticateAdmin,
  verifyContact,
  handleValidationErrors,
  ContactController.create
);
router.put(
  "/:id",
  authenticateAdmin,
  verifyContact,
  handleValidationErrors,
  ContactController.update
);
router.delete("/", authenticateAdmin, ContactController.delete);

module.exports = router;
