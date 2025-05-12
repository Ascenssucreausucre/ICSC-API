const express = require("express");
const router = express.Router();
const CommitteeController = require("../controllers/CommitteeController");
const getCurrentConference = require("../middleware/getCurrentConference");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  verifyCommittee,
  handleValidationErrors,
  verifyCommitteeMember,
  verifyCommitteeMembers,
} = require("../middleware/validators");

// Récupérer tous les comités
router.get("/", CommitteeController.getAllCommittees);

// Récupérer les comités de la conférence actuelle
router.get(
  "/current",
  getCurrentConference,
  CommitteeController.getCurrentCommittees
);

// Récupérer un comité par son ID
router.get("/:id", CommitteeController.getCommitteeById);

// Créer un nouveau comité
router.post(
  "/",
  authenticateAdmin,
  verifyCommittee,
  handleValidationErrors,
  CommitteeController.createCommittee
);

// Supprimer un comité
router.delete(
  "/delete/:id",
  authenticateAdmin,
  CommitteeController.deleteCommitte
);

// Mettre à jour un comité
router.put(
  "/update/:id",
  authenticateAdmin,
  verifyCommittee,
  handleValidationErrors,
  CommitteeController.updateCommittee
);

// Ajouter un membre à un comité
router.post(
  "/add-member",
  authenticateAdmin,
  verifyCommitteeMember,
  handleValidationErrors,
  CommitteeController.addMemberToCommittee
);

router.post(
  "/add-members",
  authenticateAdmin,
  verifyCommitteeMembers,
  handleValidationErrors,
  CommitteeController.addMembersToCommittee
);

// Retirer un membre d'un comité
router.post(
  "/remove-member",
  authenticateAdmin,
  CommitteeController.removeMemberFromCommittee
);
router.post(
  "/remove-members",
  authenticateAdmin,
  CommitteeController.removeMembersFromCommittee
);

module.exports = router;
