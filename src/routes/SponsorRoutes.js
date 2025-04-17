const express = require("express");
const router = express.Router();
const SponsorController = require("../controllers/SponsorController");
const getCurrentConference = require("../middleware/getCurrentConference");
const authenticateAdmin = require("../middleware/authenticateAdmin");
const upload = require("../middleware/uploads");
const {
  verifySponsors,
  handleValidationErrors,
} = require("../middleware/validators");

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
  upload.single("image"),
  verifySponsors,
  handleValidationErrors,
  SponsorController.createSponsor
);
router.post(
  "/:conference_id",
  authenticateAdmin,
  upload.single("image"),
  verifySponsors,
  handleValidationErrors,
  SponsorController.createSponsor
);

// Mettre à jour un sponsor existant
router.put(
  "/update/:id",
  authenticateAdmin,
  upload.single("image"),
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
