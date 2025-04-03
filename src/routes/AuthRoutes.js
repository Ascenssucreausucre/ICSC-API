const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController"); // Le contrôleur pour gérer l'admin
const authenticateAdmin = require("../middleware/authenticateAdmin");

// Route pour login
router.post("/login", AdminController.login);
router.post("/logout", AdminController.logout);
router.get("/check-auth", AdminController.checkAuth);
// router.post("/register", AdminController.createAdmin);

module.exports = router;
