const express = require("express");
const router = express.Router();
const ArticleController = require("../controllers/ArticleController");
const getCurrentConference = require("../middleware/getCurrentConference");
const authenticateAdmin = require("../middleware/authenticateAdmin");

router.get("/", ArticleController.findAllArticles);
router.get("/find-by-author/:authorId", ArticleController.findArticleByAuthor);
router.post(
  "/",
  authenticateAdmin,
  getCurrentConference,
  ArticleController.createArticle
);
router.delete(
  "/delete/:id",
  authenticateAdmin,
  ArticleController.deleteArticleById
);
router.put("/update/:id", authenticateAdmin, ArticleController.updateArticle);

module.exports = router;
