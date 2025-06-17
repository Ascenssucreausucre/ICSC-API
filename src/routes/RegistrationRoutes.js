const express = require("express");
const router = express.Router();
const RegistrationController = require("../controllers/RegistrationController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const getCurrentConference = require("../middleware/getCurrentConference");

router.get("/", authenticateAdmin, RegistrationController.getAll);
router.get(
  "/current",
  authenticateAdmin,
  getCurrentConference,
  RegistrationController.getByConference
);
router.get(
  "/:conference_id",
  authenticateAdmin,
  RegistrationController.getByConference
);
router.get("/:id", authenticateAdmin, RegistrationController.getById);

router.delete("/:id", authenticateAdmin, RegistrationController.delete);

module.exports = router;
