const express = require("express");
const router = express.Router();
const AuthorController = require("../controllers/AuthorController");

router.get("/", AuthorController.getAllAuthors);
router.post("/", AuthorController.createAuthor);
router.delete("/delete/:id", AuthorController.deleteAuthor);
router.put("/update/:id", AuthorController.updateAuthor);

module.exports = router;
