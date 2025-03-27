const express = require("express");
const router = express.Router();
const NewsController = require("../controllers/NewsController");

router.get("/", NewsController.getAllNews);
router.get("/current", NewsController.getNewsByTimeStamp);
router.get("/:id", NewsController.getNewsById);
router.post("/", NewsController.createNews);
router.put("/update/:id", NewsController.updateNews);
router.delete("/delete/:id", NewsController.deleteNewsById);
router.delete("/delete-past-news", NewsController.deletePastNews);

module.exports = router;
