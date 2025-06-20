const express = require("express");
const router = express.Router();
const SponsorController = require("../controllers/SponsorController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const createUploader = require("../middleware/uploads");
const {
  verifySponsors,
  handleValidationErrors,
} = require("../middleware/validators");

const uploadSponsor = createUploader({
  folder: "sponsors",
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxSize: 5 * 1024 * 1024, // 5 Mo
});

router.get("/", SponsorController.getAllSponsors);

router.get(
  "/conference/:conference_id",
  SponsorController.getSponsorsByConference
);

router.post(
  "/",
  authenticateAdmin,
  uploadSponsor.single("image"),
  verifySponsors,
  handleValidationErrors,
  SponsorController.createSponsor
);
router.post(
  "/:conference_id",
  authenticateAdmin,
  uploadSponsor.single("image"),
  verifySponsors,
  handleValidationErrors,
  SponsorController.createSponsor
);

router.put(
  "/update/:id",
  authenticateAdmin,
  uploadSponsor.single("image"),
  verifySponsors,
  handleValidationErrors,
  SponsorController.updateSponsor
);

router.delete(
  "/delete/:id",
  authenticateAdmin,
  SponsorController.deleteSponsor
);

module.exports = router;
