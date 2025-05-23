const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

router.post("/register", UserController.register);
router.post("/login", UserController.logIn);
router.post("/logout", UserController.logOut);
router.get("/profile", UserController.getProfile);
router.put("/update", UserController.update);
router.delete("/delete/:id", UserController.delete);

module.exports = router;
