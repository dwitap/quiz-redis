const express = require("express");
const homeController = require("../controllers/homeController.js");

const router = express.Router();

router.get("/", homeController.getListApi);
router.get("/userAuthorization", homeController.userAuthorization);
router.get("/adminAuthorization", homeController.adminAuthorization);

module.exports = router;
