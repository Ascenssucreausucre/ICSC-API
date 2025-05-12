const express = require("express");
const router = express.Router();
const ArticleController = require("../controllers/ArticleController");
const getCurrentConference = require("../middleware/getCurrentConference");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  verifyArticle,
  handleValidationErrors,
} = require("../middleware/validators");

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

module.exports = router;
