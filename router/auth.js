const router = require('express').Router();
const { signin, signup } = require('../controllers/authController');
const { validate } = require('../validators');
const { rules: signupRules } = require('../validators/auth/signup');
const { rules: signinRules } = require('../validators/auth/signin');

router.post('/signin', signinRules(), validate, signin);
router.post('/signup', signupRules(), validate, signup);

module.exports = router;
