const router = require('express').Router();

router.use('/', require('./auth'));
router.use('/users', require('./user'));
module.exports = router;
