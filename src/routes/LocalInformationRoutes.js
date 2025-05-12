const express = require("express");
const router = express.Router();
const LocalInformationController = require("../controllers/LocalInformationController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const createUploader = require("../middleware/uploads");
const {
  verifyLocalInformations,
  handleValidationErrors,
} = require("../middleware/validators");
const getCurrentConference = require("../middleware/getCurrentConference");

const uploadFile = createUploader({
  folder: "local-informations",
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

// router.get("/", LocalInformationController.getAll);
router.get(
  "/conference/:conference_id",
  LocalInformationController.getByConference
);
router.get(
  "/current",
  getCurrentConference,
  LocalInformationController.getByConference
);
router.post(
  "/",
  authenticateAdmin,
  uploadFile.single("file"),
  verifyLocalInformations,
  handleValidationErrors,
  LocalInformationController.create
);
router.put(
  "/:id",
  authenticateAdmin,
  uploadFile.single("file"),
  verifyLocalInformations,
  handleValidationErrors,
  LocalInformationController.update
);
router.delete("/:id", authenticateAdmin, LocalInformationController.delete);

module.exports = router;
