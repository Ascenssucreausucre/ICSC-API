const express = require("express");
const router = express.Router();
const RegistrationFeeController = require("../controllers/RegistrationFeeController");

router.get("/", RegistrationFeeController.getAllRegistrationFeesWithCategories);
router.post(
  "/create",
  RegistrationFeeController.createRegistrationFeeWithCategories
);
router.put(
  "/update/:id",
  RegistrationFeeController.updateRegistrationFeeWithCategories
);
router.delete("/delete/:id", RegistrationFeeController.deleteRegistrationFee);

module.exports = router;
