const express = require("express");
const router = express.Router();
const ArticleController = require("../controllers/ArticleController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  verifyArticle,
  handleValidationErrors,
} = require("../middleware/validators");
const createUploader = require("../middleware/uploads");

const uploadFile = createUploader({
  folder: "excel-files",
  allowedTypes: [
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  ],
  maxSize: 10 * 1024 * 1024, // 10 Mo (adjustable)
});

router.get("/", ArticleController.findAllArticles);
router.get("/find-by-author/:authorId", ArticleController.findArticleByAuthor);
router.get(
  "/find-by-conference/:conference_id",
  ArticleController.findArticlesByConference
);
router.post(
  "/",
  authenticateAdmin,
  verifyArticle,
  handleValidationErrors,
  ArticleController.createArticle
);
router.delete(
  "/delete/:id",
  authenticateAdmin,
  ArticleController.deleteArticleById
);
router.put(
  "/update/:id",
  authenticateAdmin,
  verifyArticle,
  handleValidationErrors,
  ArticleController.updateArticle
);

router.put(
  "/:id/update-status",
  authenticateAdmin,
  ArticleController.updateArticleStatus
);
router.put(
  "/update-status",
  authenticateAdmin,
  ArticleController.bulkUpdateArticleStatus
);

router.post(
  "/add-by-file",
  authenticateAdmin,
  uploadFile.single("file"),
  ArticleController.importByFile
);

module.exports = router;
