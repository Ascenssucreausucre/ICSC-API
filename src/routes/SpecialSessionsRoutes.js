const express = require("express");
const SpecialSessionController = require("../controllers/SpecialSessionController");
const router = express.Router();
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const getCurrentConference = require("../middleware/getCurrentConference");
const {
  verifySpecialSession,
  handleValidationErrors,
} = require("../middleware/validators");

router.get("/", SpecialSessionController.getAll);
router.get("/:conference_id", SpecialSessionController.getByConference);
router.post(
  "/",
  authenticateAdmin,
  verifySpecialSession,
  handleValidationErrors,
  SpecialSessionController.create
);
router.put(
  "/:id",
  authenticateAdmin,
  verifySpecialSession,
  handleValidationErrors,
  SpecialSessionController.update
);
router.delete("/:id", authenticateAdmin, SpecialSessionController.delete);

module.exports = router;
