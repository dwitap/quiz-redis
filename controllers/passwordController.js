const db = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const handlebars = require("handlebars");
const emailer = require("../lib/emailer");
const fs = require("fs");
const { signToken, decodeToken } = require("../lib/password");

const PasswordController = {
  changePassword: async (req, res) => {
    try {
      const { password, newPassword } = req.body;

      const findUser = await db.User.findOne({
        where: {
          id: req.user.id,
        },
      });

      const passwordValid = bcrypt.compareSync(password, findUser.password);

      if (passwordValid) {
        const hashedPassword = await bcrypt.hash(newPassword, 5);

        await db.User.update(
          {
            password: hashedPassword,
          },
          {
            where: {
              id: findUser.id,
            },
          }
        );

        res.status(200).json({
          status: "success",
          message: "Password updated successfully",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  sendEmail: async (req, res) => {
    try {
      const { email } = req.body;

      const findUser = await db.User.findOne({
        where: {
          email: email,
        },
      });

      if (findUser) {
        const token = signToken({
          id: findUser.id,
        });

        const resetPassLink = `${process.env.SENDEMAIL_FORGOT}${token}`;

        const rawHTML = fs.readFileSync("templates/forgot_pass.html", "utf-8");
        const compiledHTML = handlebars.compile(rawHTML);
        const htmlResult = compiledHTML({
          resetPassLink,
        });

        await emailer({
          to: email,
          html: htmlResult,
          subject: "Reset your password",
          text: "You can reset your password",
        });

        return res.status(200).json({
          status: "success",
          message: "You will receive a reset email",
        });
      }

      if (!findUser) {
        return res.status(403).json({
          status: "fail",
          message: "Account not verified",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;

      const { token } = req.query;

      const idUser = decodeToken(token);

      const hashedPassword = bcrypt.hashSync(password, 5);

      await db.User.update(
        {
          password: hashedPassword,
        },
        {
          where: {
            id: idUser.id,
          },
        }
      );

      return res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
};

module.exports = PasswordController;
