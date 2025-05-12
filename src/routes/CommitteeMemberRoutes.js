const express = require("express");
const router = express.Router();
const CommitteeMemberController = require("../controllers/CommitteeMemberController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");

// Créer un membre de comité
router.post(
  "/",
  authenticateAdmin,
  CommitteeMemberController.createCommitteeMember
);

// Créer des membres de comité
router.post(
  "/bulk",
  authenticateAdmin,
  CommitteeMemberController.createCommitteeMembers
);

// Récupérer un membre par son ID
router.get("/:id", CommitteeMemberController.getMemberById);

router.get("/", CommitteeMemberController.getExistingCommitteeMembers);

router.get("/members-to-clear", CommitteeMemberController.getMembersToClear);

// Mettre à jour le rôle d'un membre dans un comité
router.put(
  "/update-role",
  authenticateAdmin,
  CommitteeMemberController.updateMemberRole
);
router.put(
  "/update-roles",
  authenticateAdmin,
  CommitteeMemberController.updateMemberRoles
);
router.put(
  "/update-member/:id",
  authenticateAdmin,
  CommitteeMemberController.updateMember
);
router.put(
  "/update-members",
  authenticateAdmin,
  CommitteeMemberController.updateMembers
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
router.delete(
  "/members-to-clear",
  authenticateAdmin,
  CommitteeMemberController.clearMembers
);

module.exports = router;
