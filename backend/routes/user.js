const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'Usuario creado correctament',
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });
    });
});

router.post("/login", (req, res, next) => {
  let fetchedUser;
  User.findOne({email: req.body.email})
    .then(user => {
      if(!user) {
        return res.status(401).json({
          message: 'no se encontró el email'
        })
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password); // retorna otra promesa
    })
    .then(result => {
      if(!result) {
        return res.status(401).json({
          message: 'password incorrecta'
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        'esto-deberia-ser-la-pera-de-largo',
        { expiresIn: '1h' }  // parámetro opcional
      );
      res.status(200).json({
        token: token
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: 'Falló la autenticación 3'
      })
    })
});

module.exports = router;
