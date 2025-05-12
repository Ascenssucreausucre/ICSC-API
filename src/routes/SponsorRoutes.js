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

// Récupérer tous les sponsors
router.get("/", SponsorController.getAllSponsors);

// Récupérer les sponsors d'une conférence spécifique
router.get(
  "/conference/:conference_id",
  SponsorController.getSponsorsByConference
);

// Créer un nouveau sponsor
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

// Mettre à jour un sponsor existant
router.put(
  "/update/:id",
  authenticateAdmin,
  uploadSponsor.single("image"),
  verifySponsors,
  handleValidationErrors,
  SponsorController.updateSponsor
);

// Supprimer un sponsor
router.delete(
  "/delete/:id",
  authenticateAdmin,
  SponsorController.deleteSponsor
);

module.exports = router;
