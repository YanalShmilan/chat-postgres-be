const { body } = require('express-validator');

exports.rules = () => [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
];
