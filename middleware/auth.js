const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Missing Token' });
  }
  jwt.verify(token, 'secret', (err, user) => {
    if (err) {
      return res.status(401).json(err);
    }
    req.user = user;
  });
  next();
};
