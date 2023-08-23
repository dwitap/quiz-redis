const express = require("express");
const profileController = require("../controllers/profileController");
const { verifyToken } = require("../minddlewares/authMiddleware");
const router = express.Router();

router.patch("/", verifyToken, profileController.updateProfile);
router.get("/", verifyToken, profileController.detailUser);

module.exports = router;
