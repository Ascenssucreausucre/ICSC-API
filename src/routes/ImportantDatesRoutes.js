const express = require("express");
const router = express.Router();
const ImportantDatesController = require("../controllers/ImportantDatesController");

router.get("/", ImportantDatesController.getAllImportantDates);
router.get("/:id", ImportantDatesController.getImportantDatesById);
router.post("/", ImportantDatesController.createImportantDate);
router.put(
  "/update/:conference_id",
  ImportantDatesController.updateImportantDates
);
router.delete(
  "/delete/:conference_id",
  ImportantDatesController.deleteImportantDates
);

module.exports = router;
