const express = require("express");
const dotenv = require("dotenv");
const db = require("./models");
const cors = require("cors");
const fs = require("fs");

dotenv.config();

const PORT = 2000;

const app = express();

app.use(cors());
app.use(express.json());

const userRoute = require("./routes/authRoute");
const quizRoute = require("./routes/quizRoute");
const profileRoute = require("./routes/profileRoute");

app.use("/api/auth", userRoute);
app.use("/api/quiz", quizRoute);
app.use("/api/pp", profileRoute);

app.listen(PORT, () => {
  db.sequelize.sync({ alter: true });

  console.log("Listening in port", PORT);
});
