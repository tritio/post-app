const express = require('express');
const Post = require('../models/post');
const multer = require('multer'); // permite extraer ficheros enviados al servidor
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP =  {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images")   // primer parámetro es el error, segundo parámetro la carpeta en la dirección relativa a donde esté server.js
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
})

router.post(
  '',
  checkAuth,
  multer({storage: storage}).single("image"), (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename  // req.file nos lo proporciona multer
    })
    post.save().then(createdPost => {
      res.status(201).json({
        message: 'Post agregado correctamente',
        post: {
          ...createdPost,
          id: createdPost._id
        }
    })
    });
});

router.put('/:id',checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath

  });
  Post.updateOne({_id: req.params.id}, post).then(result => {
    res.status(200).json({message: "actualizado correctamente"});
  });
});

router.get('',(req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {  // si alguno de estos valores es cero no pasa por el if
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.countDocuments();  // si hacemos un return en un then block, estamos creando otra promesa
    })
    .then(count => {
      res.status(200).json({
          message: 'Post obtenido correctamente',
          posts: fetchedPosts,
          maxPosts: count
        });
    } )
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post no encontrado'});
    }
  })
});

router.delete('/:id',checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({message: 'Post borrado'});
  })
});

module.exports = router;
