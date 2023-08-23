const express = require("express");
const authController = require("../controllers/authController");
const { body } = require("express-validator");
const router = express.Router();

router.post(
  "/register",
  body(
    "username",
    "Username length has to be min 3 and only contain alphanumeric chars"
  )
    .isLength({ min: 3 })
    .isAlphanumeric(),
  body("email").isEmail(),
  body(
    "password",
    "Minimum password length is 8 and contains a minimum of 1 number, 1 lowercase, 1 uppercase, and 1 symbol,"
  ).isStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
    minLowercase: 1,
  }),
  authController.registerUser
);
router.post("/login", authController.loginUser);
router.get("/verification", authController.verifyUser);

module.exports = router;
