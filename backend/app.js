
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const usuario = require('./datos');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect(
  `mongodb+srv://${usuario.USER}:${usuario.PASS}@cluster0-dbncx.mongodb.net/node-angular?retryWrites=true&w=majority`,
  { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log('Conectado a la base de datos');
    console.log(usuario.USER)
  })
  .catch(() => {
    console.log('Conexión FALLIDA a la base de datos');
  });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader(
    'Access-Control-Allow-Headers',
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
})

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
