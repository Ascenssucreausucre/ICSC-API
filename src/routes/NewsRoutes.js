const express = require("express");
const router = express.Router();
const NewsController = require("../controllers/NewsController");
const getCurrentConference = require("../middleware/getCurrentConference");
const authenticateAdmin = require("../middleware/authenticateAdmin");
const {
  verifyNews,
  handleValidationErrors,
} = require("../middleware/validators");

router.get("/", NewsController.getAllNews);
router.get("/current", NewsController.getNewsByTimeStamp);
router.get("/:id", NewsController.getNewsById);
router.post(
  "/",
  authenticateAdmin,
  verifyNews,
  handleValidationErrors,
  NewsController.createNews
);
router.put(
  "/update/:id",
  authenticateAdmin,
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
