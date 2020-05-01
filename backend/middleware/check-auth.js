const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, 'esto-deberia-ser-la-pera-de-largo');
    next();

  } catch (error) {
    res.status(401).json({message: 'Autorización fallida, ¡ooooohhhh!'});
  }
}
