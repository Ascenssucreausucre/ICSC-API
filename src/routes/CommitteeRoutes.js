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

router.get("/", CommitteeController.getAllCommittees);

router.get(
  "/current",
  getCurrentConference,
  CommitteeController.getCurrentCommittees
);

router.get("/:id", CommitteeController.getCommitteeById);

router.post(
  "/",
  authenticateAdmin,
  verifyCommittee,
  handleValidationErrors,
  CommitteeController.createCommittee
);

router.delete(
  "/delete/:id",
  authenticateAdmin,
  CommitteeController.deleteCommitte
);

router.put(
  "/update/:id",
  authenticateAdmin,
  verifyCommittee,
  handleValidationErrors,
  CommitteeController.updateCommittee
);

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
