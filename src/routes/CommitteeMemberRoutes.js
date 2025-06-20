const express = require("express");
const router = express.Router();
const CommitteeMemberController = require("../controllers/CommitteeMemberController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");

router.post(
  "/",
  authenticateAdmin,
  CommitteeMemberController.createCommitteeMember
);

router.post(
  "/bulk",
  authenticateAdmin,
  CommitteeMemberController.createCommitteeMembers
);

router.get("/:id", CommitteeMemberController.getMemberById);

router.get("/", CommitteeMemberController.getExistingCommitteeMembers);

router.get("/members-to-clear", CommitteeMemberController.getMembersToClear);

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

router.get(
  "/committee/:committee_id",
  CommitteeMemberController.getMembersByCommittee
);

router.post(
  "/add-role",
  authenticateAdmin,
  CommitteeMemberController.addRoleToMember
);

router.post(
  "/remove-role",
  authenticateAdmin,
  CommitteeMemberController.removeRoleFromMember
);

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
