const express = require("express");
const router = express.Router();
const WorkshopController = require("../controllers/WorkshopController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const createUploader = require("../middleware/uploads");
const {
  verifyWorkshop,
  handleValidationErrors,
} = require("../middleware/validators");

const uploadFile = createUploader({
  folder: "workshop-files",
  allowedTypes: [
    "application/pdf", // .pdf
    "application/msword", // .doc (ancien format Word)
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  ],
  maxSize: 10 * 1024 * 1024, // 10 Mo (ajustable)
});

router.get("/", WorkshopController.getAll);
router.get("/conference/:conference_id", WorkshopController.getByConference);
router.post(
  "/",
  authenticateAdmin,
  uploadFile.single("additional_file"),
  verifyWorkshop,
  handleValidationErrors,
  WorkshopController.create
);
router.put(
  "/:id",
  authenticateAdmin,
  uploadFile.single("additional_file"),
  verifyWorkshop,
  handleValidationErrors,
  WorkshopController.update
);
router.delete("/:id", authenticateAdmin, WorkshopController.delete);

module.exports = router;
