const express = require("express");
const router = express.Router();
const ArticleController = require("../controllers/ArticleController");

router.get("/", ArticleController.findAllArticles);
router.get("/find-by-author/:authorId", ArticleController.findArticleByAuthor);
router.post("/", ArticleController.createArticle);
router.delete("/delete/:id", ArticleController.deleteArticleById);
router.put("/update/:id", ArticleController.updateArticle);

module.exports = router;
