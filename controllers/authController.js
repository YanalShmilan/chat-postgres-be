const User = require('../models').User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Incorrect password' });
    const userWithToken = generateToken(user.get({ raw: true }));
    return res.status(200).send(userWithToken);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  //   return res.send({ email, password });
};

exports.signup = async (req, res) => {
  const { password } = req.body;

  try {
    req.body.password = await bcrypt.hash(password, 10);
    const user = await User.create(req.body);
    const userWithToken = generateToken(user.get({ raw: true }));
    return res.status(201).send(userWithToken);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const generateToken = (user) => {
  delete user.password;
  const token = jwt.sign(user, 'secret', { expiresIn: '30d' });
  return { ...user, token };
};
