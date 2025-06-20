const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController");
const {
  authenticateSuperAdmin,
  authenticateAdmin,
} = require("../middleware/authenticateAdmin");

router.post("/login", AdminController.login);
router.post("/logout", AdminController.logout);
router.get("/check-auth", AdminController.checkAuth);
router.post("/create", authenticateSuperAdmin, AdminController.createAdmin);
router.delete("/:id", authenticateSuperAdmin, AdminController.deleteAdmin);
router.get("/me", authenticateAdmin, AdminController.getCurrentAdmin);
router.get("/", authenticateSuperAdmin, AdminController.getAllAdmin);

module.exports = router;
