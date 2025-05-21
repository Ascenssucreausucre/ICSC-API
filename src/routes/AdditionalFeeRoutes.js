const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  handleValidationErrors,
  verifyAdditionalFees,
} = require("../middleware/validators");
const AdditionalFeeController = require("../controllers/AdditionalFeeController");

router.get(
  "/:conference_id",
  AdditionalFeeController.getAdditionalFeeByConference
);

router.post(
  "/",
  authenticateAdmin,
  verifyAdditionalFees,
  handleValidationErrors,
  AdditionalFeeController.addAdditionalFee
);

router.put(
  "/:id",
  authenticateAdmin,
  verifyAdditionalFees,
  handleValidationErrors,
  AdditionalFeeController.updateAdditionalFee
);

router.delete(
  "/:id",
  authenticateAdmin,
  AdditionalFeeController.deleteAdditionalFee
);

module.exports = router;
