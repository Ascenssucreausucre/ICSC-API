const express = require("express");
const router = express.Router();
const ImportantDatesController = require("../controllers/ImportantDatesController");
const getCurrentConference = require("../middleware/getCurrentConference");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  verifyImportantDates,
  handleValidationErrors,
} = require("../middleware/validators");

router.get("/", ImportantDatesController.getAllImportantDates);
router.get("/dates/:id", ImportantDatesController.getImportantDatesById);
router.get(
  "/current",
  getCurrentConference,
  ImportantDatesController.getCurrentImportantDates
);
router.post(
  "/",
  authenticateAdmin,
  verifyImportantDates,
  handleValidationErrors,
  ImportantDatesController.createImportantDate
);
router.put(
  "/update/:conference_id",
  authenticateAdmin,
  verifyImportantDates,
  handleValidationErrors,
  ImportantDatesController.updateImportantDates
);
router.delete(
  "/delete/:conference_id",
  authenticateAdmin,
  ImportantDatesController.deleteImportantDates
);

module.exports = router;
