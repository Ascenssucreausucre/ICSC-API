const express = require("express");
const router = express.Router();
const AuthorController = require("../controllers/AuthorController");
const authenticateAdmin = require("../middleware/authenticateAdmin");

router.get("/", AuthorController.getAllAuthors);
router.post("/", authenticateAdmin, AuthorController.createAuthor);
router.delete("/delete/:id", authenticateAdmin, AuthorController.deleteAuthor);
router.put("/update/:id", authenticateAdmin, AuthorController.updateAuthor);

module.exports = router;
