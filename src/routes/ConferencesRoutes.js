const express = require("express");
const router = express.Router();
const ConferenceController = require("../controllers/ConferenceController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const createUploader = require("../middleware/uploads");

const {
  verifyConference,
  handleValidationErrors,
} = require("../middleware/validators");
const getCurrentConference = require("../middleware/getCurrentConference");

const uploadBanner = createUploader({
  folder: "conference-banners",
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxSize: 5 * 1024 * 1024, // 5 Mo
});

router.get("/", ConferenceController.getAllConferences);
router.get("/current", ConferenceController.getCurrentConference);
router.get("/:id", ConferenceController.getConferenceById);
router.post(
  "/",
  authenticateAdmin,
  uploadBanner.single("banner"),
  verifyConference,
  handleValidationErrors,
  ConferenceController.createConference
);
router.put(
  "/update/:id",
  authenticateAdmin,
  uploadBanner.single("banner"),
  verifyConference,
  handleValidationErrors,
  ConferenceController.updateConference
);
router.put(
  "/:id/setCurrent",
  authenticateAdmin,
  ConferenceController.setCurrentConference
);
router.put(
  "/toggle-registrations",
  authenticateAdmin,
  getCurrentConference,
  ConferenceController.toggleRegistrations
);
router.delete(
  "/delete/:id",
  authenticateAdmin,
  ConferenceController.deleteConference
);

module.exports = router;
