const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");

router.post("/register", UserController.register);
router.post("/login", UserController.logIn);
router.post("/logout", UserController.logOut);
router.get("/profile", UserController.getProfile);
router.get("/profile/:userId", authenticateAdmin, UserController.getUser);
router.get("/get-all", authenticateAdmin, UserController.getAll);
router.put("/update", authenticateAdmin, UserController.update);
router.delete("/delete/:id", UserController.delete);

module.exports = router;
