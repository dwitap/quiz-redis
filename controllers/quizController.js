const Redis = require("ioredis");
const redis = new Redis();

const quiz = require("../databases/quiz");
const dbQuiz = quiz.soal;

const bucket = require("../databases/round");
const dbBucket = bucket.bucket;

const db = require("../models");
const User = db.User;

const responseHelper = require("../helper/responseHelper");

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Generate a random index between 0 and i
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements at i and j
  }
  return array;
}

function calculateScore(time, score) {
  switch (time) {
    case time <= 10:
      score += 10;
      break;
    case time <= 20:
      score += 9;
      break;
    case time <= 30:
      score += 8;
      break;
    case time <= 40:
      score += 7;
      break;
    case time <= 50:
      score += 6;
      break;
    case time <= 60:
      score += 5;
      break;
    default:
      break;
  }

  return score;
}

// console.log(shuffleArray(dbBucket));
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

      const questionBucketRedis = await redis.get(
        "questionbucket-" + verifyUser.phone_number
      );

      if (!questionBucketRedis) {
        const shuffle = shuffleArray(dbBucket[phoneNumberLastDigit]);

        await redis.set(
          "questionbucket-" + verifyUser.phone_number,
          JSON.stringify(shuffle)
        );
      }

      const soal = JSON.parse(questionBucketRedis);

      let getQuestionActive = await redis.get(
        "questionActive-" + verifyUser.phone_number
      );

      let realQuestion = "";

      if (!getQuestionActive) {
        await redis.set("questionActive-" + verifyUser.phone_number, 0);
        getQuestionActive = await redis.get(
          "questionActive-" + verifyUser.phone_number
        );
        realQuestion = soal[getQuestionActive];
      } else {
        await redis.set(
          "questionActive-" + verifyUser.phone_number,
          Number(getQuestionActive) + 1
        );
        realQuestion = soal[getQuestionActive];
      }

      const y = dbQuiz.find((item) => item.id === Number(realQuestion));

      await redis.set(
        "questionToAnswer-" + verifyUser.phone_number,
        JSON.stringify(y)
      );
      // set redis expire time
      await redis.expire("questionToAnswer-" + verifyUser.phone_number, 60);

      return res.json(y);
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
          username: "naraya",
        },
      });

      const getQuestion = await redis.get(
        "questionToAnswer-" + verifyUser.phone_number
      );

      if (!getQuestion) {
        return res.status(500).json({
          message: "Server Error when answered",
        });
      }

      const afterConvert = JSON.parse(getQuestion);

      console.log(afterConvert);
      const result = "";

      let currentScore = await redis.get("scores-" + verifyUser.phone_number);
      let finalScore = 0;

      const timeExpire = await redis.ttl(
        "questionToAnswer-" + verifyUser.phone_number
      );

      console.log(result);

      if (result) {
        if (!currentScore) {
          currentScore = 10;
        }
        finalScore = calculateScore(timeExpire, Number(currentScore));
        console.log(
          "the final score",
          finalScore,
          "the currentScore",
          currentScore
        );
        await redis.set("scores-" + verifyUser.phone_number, finalScore);
      } else {
        if (!currentScore) {
          currentScore = 0;
        }
        await redis.set(
          "scores-" + verifyUser.phone_number,
          Number(currentScore) - 5
        );

        finalScore = Number(currentScore) - 5;
      }

      // res.json({
      //   data: finalScore,
      // });
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
          username: "naraya",
        },
      });

      await redis.del("questionbucket-" + verifyUser.phone_number);
      await redis.del("questionActive-" + verifyUser.phone_number);
      await redis.del("questionToAnswer-" + verifyUser.phone_number);
      await redis.del("scores-" + verifyUser.phone_number);

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
  randomQuiz: async (req, res) => {
    try {
      const username = req.body.username;
      const user = await User.findOne({
        raw: true,
        where: {
          username,
        },
      });

      if (!user) {
        return responseHelper(res, 401, "", "Username not found");
      }

      const phoneNumberLastDigit = parseInt(user.phone_number.slice(-1));
      const questionBucketKey = "questionbucket-" + user.phone_number;

      let questionBucketRedis = await redis.get(questionBucketKey);

      if (!questionBucketRedis) {
        const shuffledBucket = shuffleArray(dbBucket[phoneNumberLastDigit]);
        await redis.set(questionBucketKey, JSON.stringify(shuffledBucket));
        questionBucketRedis = JSON.stringify(shuffledBucket);
      }

      const questionActiveKey = "questionActive-" + user.phone_number;
      let questionActive = await redis.get(questionActiveKey);

      if (!questionActive) {
        await redis.set(questionActiveKey, 0);
        questionActive = 0;
      } else {
        await redis.set(questionActiveKey, Number(questionActive) + 1);
      }

      const selectedQuestion = JSON.parse(questionBucketRedis)[questionActive];
      const foundQuestion = dbQuiz.find(
        (item) => item.id === Number(selectedQuestion)
      );

      return res.json(foundQuestion);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Server Error show all data",
      });
    }
  },
};

module.exports = quizController;