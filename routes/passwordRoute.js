const express = require("express");
const passwordController = require("../controllers/passwordController");
const { verifyToken } = require("../minddlewares/authMiddleware");

const router = express.Router();

router.patch("/change", verifyToken, passwordController.changePassword);
router.post("/send", passwordController.sendEmail);
router.patch("/reset", passwordController.resetPassword);

module.exports = router;
