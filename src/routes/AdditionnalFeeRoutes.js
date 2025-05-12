const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  handleValidationErrors,
  verifyAdditionnalFees,
} = require("../middleware/validators");
const AdditionnalFeeController = require("../controllers/AdditionnalFeeController");

router.get(
  "/:conference_id",
  AdditionnalFeeController.getAdditionnalFeeByConference
);

router.post(
  "/",
  authenticateAdmin,
  verifyAdditionnalFees,
  handleValidationErrors,
  AdditionnalFeeController.addAdditionnalFee
);

router.put(
  "/:id",
  authenticateAdmin,
  verifyAdditionnalFees,
  handleValidationErrors,
  AdditionnalFeeController.updateAdditionnalFee
);

router.delete(
  "/:id",
  authenticateAdmin,
  AdditionnalFeeController.deleteAdditionnalFee
);

module.exports = router;
