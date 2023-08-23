const fs = require("fs");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const handlebars = require("handlebars");
const { validationResult } = require("express-validator");

const emailer = require("../lib/emailer");
const db = require("../models");
const { signToken } = require("../lib/jwt");
const {
  createVerificationToken,
  validateVerificationToken,
} = require("../lib/verification");
const User = db.User;

const authController = {
  registerUser: async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const { username, email, password, phone_number } = req.body;

      const findUserByUsernameOrEmail = await User.findOne({
        where: {
          [Op.or]: {
            username,
            email,
          },
        },
      });

      if (findUserByUsernameOrEmail) {
        return res.status(400).json({
          message: "Username or email has been used",
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 5);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        phone_number,
      });

      const verificationToken = createVerificationToken({
        id: newUser.id,
      });

      const verificationLink = `${process.env.SENDEMAIL_REGISTER}${verificationToken}`;

      const rawHTML = fs.readFileSync("templates/register_user.html", "utf-8");
      const compiledHTML = handlebars.compile(rawHTML);
      const htmlResult = compiledHTML({
        username,
        verificationLink,
      });

      await emailer({
        to: email,
        html: htmlResult,
        subject: "Verify your account",
        text: "Please verify your account",
      });

      return res.status(201).json({
        message: "User registered",
        data: newUser,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error when registering",
      });
    }
  },
  loginUser: async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;

      const findUserByUsernameOrEmail = await User.findOne({
        where: {
          [Op.or]: {
            username: usernameOrEmail,
            email: usernameOrEmail,
          },
        },
      });

      if (!findUserByUsernameOrEmail) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      const passwordValid = bcrypt.compareSync(
        password,
        findUserByUsernameOrEmail.password
      );

      if (!passwordValid) {
        return res.status(400).json({
          message: "Password invalid",
        });
      }

      delete findUserByUsernameOrEmail.dataValues.password;

      const token = signToken({
        id: findUserByUsernameOrEmail.id,
      });

      return res.status(201).json({
        message: "Login user",
        token,
        data: findUserByUsernameOrEmail,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  verifyUser: async (req, res) => {
    try {
      const { verification_token } = req.query;
      const validToken = validateVerificationToken(verification_token);

      if (!validToken) {
        res.status(401).json({
          message: "Token invalid",
        });
      }

      await User.update(
        { is_verified: 1 },
        {
          where: {
            id: validToken.id,
          },
        }
      );

      return res.status(200).json({
        message: "Your email has been verify",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
};

module.exports = authController;
