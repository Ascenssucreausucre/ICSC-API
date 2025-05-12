const express = require("express");
const router = express.Router();
const RegistrationFeeController = require("../controllers/RegistrationFeeController");
const getCurrentConference = require("../middleware/getCurrentConference");
const { authPlugins } = require("mysql2");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  verifyRegistrationFeesWithcategories,
  handleValidationErrors,
} = require("../middleware/validators");

router.get("/", RegistrationFeeController.getAllRegistrationFeesWithCategories);
router.get(
  "/current",
  getCurrentConference,
  RegistrationFeeController.getCurrentRegistrationFeesWithCategories
);
router.post(
  "/create",
  authenticateAdmin,
  verifyRegistrationFeesWithcategories,
  handleValidationErrors,
  RegistrationFeeController.createRegistrationFeeWithCategories
);
router.put(
  "/update/:id",
  authenticateAdmin,
  verifyRegistrationFeesWithcategories,
  handleValidationErrors,
  RegistrationFeeController.updateRegistrationFeeWithCategories
);
router.delete(
  "/delete/:id",
  authenticateAdmin,
  RegistrationFeeController.deleteRegistrationFee
);

module.exports = router;
