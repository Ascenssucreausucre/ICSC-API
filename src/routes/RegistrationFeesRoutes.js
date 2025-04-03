const express = require("express");
const router = express.Router();
const RegistrationFeeController = require("../controllers/RegistrationFeeController");
const getCurrentConference = require("../middleware/getCurrentConference");
const { authPlugins } = require("mysql2");
const authenticateAdmin = require("../middleware/authenticateAdmin");

router.get("/", RegistrationFeeController.getAllRegistrationFeesWithCategories);
router.get(
  "/current",
  getCurrentConference,
  RegistrationFeeController.getCurrentRegistrationFeesWithCategories
);
router.post(
  "/create",
  authenticateAdmin,
  getCurrentConference,
  RegistrationFeeController.createRegistrationFeeWithCategories
);
router.put(
  "/update/:id",
  authenticateAdmin,
  RegistrationFeeController.updateRegistrationFeeWithCategories
);
router.delete(
  "/delete/:id",
  authenticateAdmin,
  RegistrationFeeController.deleteRegistrationFee
);

module.exports = router;
