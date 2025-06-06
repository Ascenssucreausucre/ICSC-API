const express = require("express");
const router = express.Router();
const getCurrentConference = require("../middleware/getCurrentConference");
const PaymentOptionsController = require("../controllers/PaymentOptionsController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");

router.get("/", PaymentOptionsController.getAll);
router.get(
  "/conference/current",
  getCurrentConference,
  PaymentOptionsController.getByConference
);
router.get(
  "/conference/:conference_id",
  PaymentOptionsController.getByConference
);
router.post("/", authenticateAdmin, PaymentOptionsController.create);
router.put("/:id", authenticateAdmin, PaymentOptionsController.update);
router.delete("/:id", authenticateAdmin, PaymentOptionsController.delete);

module.exports = router;
