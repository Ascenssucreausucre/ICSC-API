const express = require("express");
const router = express.Router();
const ConferenceController = require("../controllers/ConferenceController");
const authenticateAdmin = require("../middleware/authenticateAdmin");
const upload = require("../middleware/uploads");
const {
  verifyConference,
  handleValidationErrors,
} = require("../middleware/validators");

router.get("/", ConferenceController.getAllConferences);
router.get("/current", ConferenceController.getCurrentConference);
router.get("/:id", ConferenceController.getConferenceById);
router.post(
  "/",
  authenticateAdmin,
  upload.single("banner"),
  verifyConference,
  handleValidationErrors,
  ConferenceController.createConference
);
router.put(
  "/update/:id",
  authenticateAdmin,
  upload.single("banner"),
  verifyConference,
  handleValidationErrors,
  ConferenceController.updateConference
);
router.put(
  "/:id/setCurrent",
  authenticateAdmin,
  ConferenceController.setCurrentConference
);
router.delete(
  "/delete/:id",
  authenticateAdmin,
  ConferenceController.deleteConference
);

module.exports = router;
