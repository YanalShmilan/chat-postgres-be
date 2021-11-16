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
exports.search = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        [sequelize.Op.or]: {
          namesConcated: sequelize.where(
            sequelize.fn(
              'concat',
              sequelize.col('firstName'),
              ' ',
              sequelize.col('lastName')
            ),
            {
              [sequelize.Op.iLike]: `%${req.query.term}%`,
            }
          ),
        },
        email: {
          [sequelize.Op.iLike]: `%${req.query.term}%`,
        },
        [sequelize.Op.not]: {
          id: req.user.id,
        },
      },
      limit: 10,
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).end();
  }
};
