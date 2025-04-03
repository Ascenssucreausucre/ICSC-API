const express = require("express");
const router = express.Router();
const CommitteeMemberController = require("../controllers/CommitteeMemberController");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// Créer un membre de comité
router.post(
  "/",
  authenticateAdmin,
  CommitteeMemberController.createCommitteeMember
);

// Récupérer un membre par son ID
router.get("/:id", CommitteeMemberController.getMemberById);

// Mettre à jour le rôle d'un membre dans un comité
router.put(
  "/update-role",
  authenticateAdmin,
  CommitteeMemberController.updateMemberRole
);

// Récupérer tous les membres d'un comité
router.get(
  "/committee/:committee_id",
  CommitteeMemberController.getMembersByCommittee
);

// Ajouter un rôle à un membre
router.post(
  "/add-role",
  authenticateAdmin,
  CommitteeMemberController.addRoleToMember
);

// Retirer un rôle d'un membre
router.post(
  "/remove-role",
  authenticateAdmin,
  CommitteeMemberController.removeRoleFromMember
);

// Supprimer un membre
router.delete(
  "/delete/:id",
  authenticateAdmin,
  CommitteeMemberController.deleteMember
);

module.exports = router;
