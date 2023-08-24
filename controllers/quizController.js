const Redis = require("ioredis");
const redis = new Redis();

const quiz = require("../databases/quiz");
const dbQuiz = quiz.soal;

const bucket = require("../databases/round");
const dbBucket = bucket.bucket;

const db = require("../models");
const User = db.User;

const responseHelper = require("../helper/responseHelper");
const { shuffleArray, calculateScore } = require("../helper/scoresHelper");

const quizController = {
  getBucket: async (req, res) => {
    try {
      const verifyUser = await User.findOne({
        raw: true,
        where: {
          username: req.body.username,
        },
      });

      if (!verifyUser) {
        return responseHelper(res, 401, "", "Username not found");
      }
      const phoneNumberLastDigit = parseInt(verifyUser.phone_number.slice(-1));

      let shuffleBucketIndex = await redis.get(
        "questionBucket" + verifyUser.username
      );

      if (!shuffleBucketIndex) {
        const shuffle = shuffleArray(dbBucket[phoneNumberLastDigit]);

        await redis.set(
          "questionBucket" + verifyUser.username,
          JSON.stringify(shuffle)
        );

        shuffleBucketIndex = await redis.get(
          "questionBucket" + verifyUser.username
        );
      }

      const question = JSON.parse(shuffleBucketIndex);

      let questionActive = await redis.get(
        "questionActive-" + verifyUser.username
      );

      const getQuestion = await redis.get(
        "questionToAnswer-" + verifyUser.username
      );
      let realQuestion = "";

      if (!getQuestion) {
        if (!questionActive) {
          await redis.set("questionActive-" + verifyUser.username, 0);
          questionActive = await redis.get(
            "questionActive-" + verifyUser.username
          );
          realQuestion = question[questionActive];
        } else {
          await redis.set(
            "questionActive-" + verifyUser.username,
            Number(questionActive) + 1
          );
          realQuestion = question[Number(questionActive) + 1];
        }

        const response = dbQuiz.find(
          (item) => item.id === Number(realQuestion)
        );

        if (!response) {
          return responseHelper(response, 200, "", "session completed");
        }

        if (!getQuestion) {
          // Set next question
          await redis.set(
            "questionToAnswer-" + verifyUser.username,
            JSON.stringify(response)
          );
          await redis.expire("questionToAnswer-" + verifyUser.username, 86400);
          return res.json(response);
        }
      } else {
        return responseHelper(res, 200, "", "u need to answer question before");
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Server Error get question",
      });
    }
  },
  answerQuestion: async (req, res) => {
    try {
      const verifyUser = await User.findOne({
        raw: true,
        where: {
          username: req.body.username,
        },
      });

      const getQuestion = await redis.get(
        "questionToAnswer-" + verifyUser.username
      );

      if (!getQuestion) {
        return res.status(500).json({
          message: "U need get question first",
        });
      }

      const afterConvert = JSON.parse(getQuestion);
      const questionBucketRedis = await redis.get(
        "questionBucket" + verifyUser.username
      );

      const result = () => {
        return afterConvert.correctOption == req.body.answer.toUpperCase();
      };

      let currentScore = await redis.get("scores-" + verifyUser.username);
      let finalScore = 0;

      const timeExpire = await redis.ttl(
        "questionToAnswer-" + verifyUser.username
      );

      if (result()) {
        if (!currentScore) {
          currentScore = 0;
        }
        finalScore = calculateScore(timeExpire, Number(currentScore));
        await redis.set("scores-" + verifyUser.username, finalScore);
      } else {
        if (!currentScore) {
          currentScore = 0;
        }
        await redis.set(
          "scores-" + verifyUser.username,
          Number(currentScore) - 5
        );

        finalScore = Number(currentScore) - 5;
      }

      await redis.del("questionToAnswer-" + verifyUser.username);

      // const remainingBucketQuiz = JSON.parse(questionBucketRedis).filter(
      //   (quiz) => quiz !== afterConvert.id
      // );

      // await redis.set(
      //   "questionBucket" + verifyUser.username,
      //   JSON.stringify(remainingBucketQuiz)
      // );

      return responseHelper(res, 200, finalScore, "success");
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Server Error when answered",
      });
    }
  },
  clearRedis: async (req, res) => {
    try {
      const verifyUser = await User.findOne({
        raw: true,
        where: {
          username: req.body.username,
        },
      });

      await redis.del("questionBucket" + verifyUser.username);
      await redis.del("questionActive-" + verifyUser.username);
      await redis.del("questionToAnswer-" + verifyUser.username);
      await redis.del("scores-" + verifyUser.username);

      res.json({
        message: "clear redis success",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Server Error when answered",
      });
    }
  },
};

module.exports = quizController;
