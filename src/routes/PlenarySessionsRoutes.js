const express = require("express");
const PlenarySessionController = require("../controllers/PlenarySessionController");
const router = express.Router();
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const {
  handleValidationErrors,
  verifyPlenarySession,
} = require("../middleware/validators");
const createUploader = require("../middleware/uploads");
const getCurrentConference = require("../middleware/getCurrentConference");

const uploadImage = createUploader({
  folder: "plenary-sessions",
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxSize: 5 * 1024 * 1024, // 5 Mo
});

router.get("/", PlenarySessionController.getAll);
router.get(
  "/current",
  getCurrentConference,
  PlenarySessionController.getByConference
);
router.get("/:id", PlenarySessionController.getById);
router.post(
  "/",
  authenticateAdmin,
  uploadImage.single("image"),
  verifyPlenarySession,
  handleValidationErrors,
  PlenarySessionController.create
);
router.put(
  "/:id",
  authenticateAdmin,
  uploadImage.single("image"),
  verifyPlenarySession,
  handleValidationErrors,
  PlenarySessionController.update
);
router.delete("/:id", authenticateAdmin, PlenarySessionController.delete);
module.exports = router;
