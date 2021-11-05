const User = require('../models').User;
const sequelize = require('sequelize');
const bcrypt = require('bcrypt');
exports.update = async (req, res) => {
  if (req.file) {
    req.body.avatar = req.file.filename;
  }
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const [rows, result] = await User.update(req.body, {
      where: {
        id: req.user.id,
      },
      returning: true,
    });
    const user = result[0].get({ raw: true });
    user.avatar = result[0].avatar;
    delete user.password;
    return res.status(201).json(user);
  } catch {
    return res.status(500).end();
  }
};
