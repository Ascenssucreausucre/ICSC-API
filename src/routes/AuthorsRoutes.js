const express = require("express");
const router = express.Router();
const AuthorController = require("../controllers/AuthorController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  verifyAuthors,
  handleValidationErrors,
} = require("../middleware/validators");

router.get("/", AuthorController.getAllAuthors);
router.get("/with-articles", AuthorController.getAllAuthorsWithArticles);
router.get("/search/", AuthorController.searchAuthors);
router.get("/countries", AuthorController.getDistinctCountries);
router.get("/affiliations", AuthorController.getDistinctAffiliations);
router.get("/filters", AuthorController.getFilters);
router.get("/:id", AuthorController.getAuthorByPk);
router.post(
  "/",
  authenticateAdmin,
  verifyAuthors,
  handleValidationErrors,
  AuthorController.createAuthor
);
router.delete("/delete/:id", authenticateAdmin, AuthorController.deleteAuthor);
router.put(
  "/update/:id",
  authenticateAdmin,
  verifyAuthors,
  handleValidationErrors,
  AuthorController.updateAuthor
);

module.exports = router;
