const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const { authenticateAny } = require("../middleware/authenticateAny");
const {
  verifyUser,
  handleValidationErrors,
  verifyUserLogin,
  verifyUserUpdate,
} = require("../middleware/validators");

router.post(
  "/register",
  verifyUser,
  handleValidationErrors,
  UserController.register
);
router.post(
  "/login",
  verifyUserLogin,
  handleValidationErrors,
  UserController.logIn
);
router.post("/logout", UserController.logOut);
router.get("/profile", UserController.getProfile);
router.get("/profile/:userId", authenticateAdmin, UserController.getUser);
router.get("/get-all", authenticateAdmin, UserController.getAll);
router.put(
  "/update",
  authenticateAny,
  verifyUserUpdate,
  handleValidationErrors,
  UserController.update
);
router.put("/reset-author/:id", authenticateAdmin, UserController.unlinkAuthor);
router.delete("/delete/:id", authenticateAdmin, UserController.delete);

module.exports = router;
