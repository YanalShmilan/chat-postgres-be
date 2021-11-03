const { body } = require('express-validator');

exports.rules = () => [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('gender').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
];
