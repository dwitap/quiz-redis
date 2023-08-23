const express = require("express");
const quizController = require("../controllers/quizController");
const router = express.Router();

router.get("/question", quizController.getBucket);
router.get("/answer", quizController.answerQuestion);
router.get("/clear", quizController.clearRedis);

module.exports = router;
