const db = require("../models");
const User = db.User;

const profileController = {
  updateProfile: async (req, res) => {
    try {
      await User.update(req.body, {
        where: {
          id: req.user.id,
        },
      });
      return res.status(200).json({
        message: "Profile updated",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Server error updating profile",
      });
    }
  },
  detailUser: async (req, res) => {
    try {
      const findDetailUser = await User.findByPk(req.user.id);

      return res.status(200).json({
        message: "Show users detail",
        data: findDetailUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Server error detail by pk",
      });
    }
  },
};

module.exports = profileController;
