var express = require('express');
var router = express.Router();

var Users = db.model('User', require("../models/userSchema").User); // Configurado o BD com o schema usuario
var Tweet = db.model('Tweet', require("../models/tweetSchema").Tweet); // Configurado o BD com o schema tweet
var Comment = db.model('Comment', require("../models/commentSchema").Comment); // Configurado o BD com o schema tweet

/* GET todos tweets dos usuarios seguindo e seu*/
router.get('/', function (req, res, next) {
  if (req.session.login) { // Se possui sessao é redirecionado para a pagina inicial
    Users.findOne({
      user: req.session.login
    }, function (err, result) {
      var seguindo = result.follow;
      Tweet.find({
        // author: [req.session.login, seguindo]
        author: req.session.login
      }, function (err, result) {
        if (err) throw err;
        res.json(result);
      });
    });
  } else // Se não abre a pagina de login
    res.boom.unauthorized('Usuário nao autenticado!');
});

// GET todos os tweets do usuario ID
router.get('/user/:id', function (req, res) {
  if (req.session.login) {
    Users.findOne({ // Verifica se o usuario ID e valido
      user: req.params.id
    }, function (err, resul) {
      if (err) {
        console.log("Error! " + err.message);
        return err;
      } else if (resul != null) {
        Tweet.find({
          author: req.params.id
        }, function (err, result) {
          res.json(result);
        });
      } else
        res.boom.notFound("Usuario nao encontrado");
    });
  } else
    res.boom.unauthorized("Usuário nao autenticado!");
});

/* GET o tweet pelo ID */
router.get('/tweet/:id', function (req, res) {
  if (req.session.login) {
    Tweet.findOne({
      _id: req.params.id
    }, function (err, result) {
      if (err) {
        console.log("Error! " + err.message);
        return err;
      }
      if (result != null)
        res.json(result);
      else
        res.boom.notFound("Tweet nao encontrado");
    });
  } else 
    res.boom.unauthorized("Usuário nao autenticado!");
});

/* GET todos os comentarios no tweet ID */
router.get('/tweet/:id/comments', function (req, res) {
  if (req.session.login) { 
    Tweet.findOne({
      _id: req.params.id
    }, function (err, resul) {
      if (err) {
        console.log("Error! " + err.message);
        return err;
      }
      if (resul != null)
        Comment.find({
          tweet: req.params.id
        }, function (err, result) {
          res.json(result);
        });
      else
        res.boom.notFound("Tweet nao encontrado");
    });
  } else 
    res.boom.unauthorized("Usuário nao autenticado!");
});

// GET o usuario por ID e verifica se está seguindo-o
router.get('/user/:id/seguir', function (req, res) {
  if (req.session.login) {
    if (req.session.login == req.params.id)
      res.boom.notAcceptable("Não e possivel seguir a si mesmo");
    else {
      Users.findOne({ // Verifica se o usuario existe
        user: req.params.id
      }, function (err, resul) {
        if (err) {
          console.log("Error! " + err.message);
          return err;
        } else if (resul != null) {
          Users.findOne({ // Verifica se esta seguindo o usuario ID
            user: req.session.login,
            follow: {
              "$in": [req.params.id]
            }
          }, function (err, result) {
            if (result == null)
              res.json("Seguir usuario");
            else
              res.json("Seguindo");
          });
        } else
          res.boom.notFound("Usuario nao encontrado");
      });
    }
  } else 
    res.boom.unauthorized("Usuário nao autenticado!");
});

// POST para seguir o usuario ID
router.post('/user/:id/seguir', function (req, res) {
  if (req.session.login) {
    if (req.session.login == req.params.id)
      res.boom.notAcceptable("Não e possivel seguir a si mesmo");
    else {
      Users.findOne({
        user: req.params.id
      }, function (err, result) {
        if (err) {
          console.log("Error! " + err.message);
          return err;
        } else if (result != null) {
          Users.findOneAndUpdate({ // Busca o usuario da sessão e adiciona o requisitado no follow
            user: req.session.login
          }, {
            $addToSet: {
              follow: req.params.id
            }
          }, function (err) {
            if (err) {
              console.log("Error! " + err.message);
              return err;
            } else
              res.json("Seguindo usuario");
          });
        } else
          res.boom.notFound("Usuario nao encontrado");
      });
    }
  } else 
    res.boom.unauthorized("Usuario nao autenticado!");
});

// POST o comentario no tweet ID
router.post('/tweet/:id', function (req, res, next) {
  if (req.session.login) {
    Tweet.findOne({ // Verifica se o tweet é valido 
      _id: req.params.id
    }, function (err, result) {
      if (err) {
        console.log("Error! " + err.message);
        return err;
      } else if (result != null) {
        var comment = new Comment({
          comment: req.body.comment,
          author: req.session.login,
          tweet: req.params.id
        });
        comment.save(function (err) {
          if (err) {
            console.log("Error! " + err.message);
            return err;
          }
        });
        result.update({ // Atualiza na tabela do tweet o ID do comentario
          $addToSet: {
            comments: comment._id
          }
        }, function (err) {
          if (err) {
            console.log("Error! " + err.message);
            return err;
          } else
            res.status(200).json('Comentario salvo!');
        });
      } else
        res.boom.notFound("Tweet nao encontrado");
    });
  } else 
    res.boom.unauthorized("Usuário nao autenticado!");
});

// POST um novo tweet
router.post('/', function (req, res, next) {
  if (req.session.login) {
    var tweet = new Tweet({
      tweet: req.body.tweet,
      author: req.session.login
    });
    tweet.save(function (err) { // Salva o tweet no BD
      if (err) {
        console.log("Error! " + err.message);
        return err;
      } else {
        res.status(200).json('Tweet salvo!');
      }
    });
  } else 
    res.boom.unauthorized("Usuario nao autenticado!");
});

module.exports = router;
