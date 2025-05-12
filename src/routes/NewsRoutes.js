const express = require("express");
const router = express.Router();
const NewsController = require("../controllers/NewsController");
const createUploader = require("../middleware/uploads");
const getCurrentConference = require("../middleware/getCurrentConference");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  verifyNews,
  handleValidationErrors,
} = require("../middleware/validators");

const uploadFile = createUploader({
  folder: "news-files",
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

router.get("/", NewsController.getAllNews);
router.get("/current", NewsController.getNewsByTimeStamp);
router.get("/:id", NewsController.getNewsById);
router.post(
  "/",
  authenticateAdmin,
  uploadFile.single("file"),
  verifyNews,
  handleValidationErrors,
  NewsController.createNews
);
router.put(
  "/update/:id",
  authenticateAdmin,
  uploadFile.single("file"),
  verifyNews,
  handleValidationErrors,
  NewsController.updateNews
);
router.delete("/delete/:id", authenticateAdmin, NewsController.deleteNewsById);
router.delete(
  "/delete-past-news",
  authenticateAdmin,
  NewsController.deletePastNews
);

module.exports = router;
