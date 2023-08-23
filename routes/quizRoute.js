const express = require("express");
const quizController = require("../controllers/quizController");
const router = express.Router();

router.get("/b", quizController.getBucket);
router.get("/q", quizController.randomQuiz);
router.get("/a", quizController.answerQuestion);
router.get("/c", quizController.clearRedis);

module.exports = router;
