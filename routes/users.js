var express = require('express');
var router = express.Router();

var schema = require("../models/userSchema"); // Importando a configuracao do BD
var Users = db.model('User', schema.User); // Obtendo colecao do login

// GET se o usuario esta autenticado
router.get('/', function (req, res, next) {
  sess = req.session;
  if (sess.login) { 
    res.status(200).json({
      'saida': 'Usuário autenticado!'
    });
  } else
    res.boom.badRequest("Usuário sem acesso!");
});

// POST o login do usuario
router.post('/login', function (req, res, next) {
  sess = req.session;
  sess.login = req.body.user;
  if (sess.login) {
    Users.find({ // Pesquisa o usuario no BD
      user: sess.login
    }, function (err, result) {
      if (err) {
        console.log("Error! " + err.message);
        return err;
      } else if (result.length != 0 && result[0].passwd == req.body.senha) { // Se encontrado e senha correta
        req.session.authenticated = true; // Habilita a sessao
        res.status(202).json({
          'message': "Acesso liberado!!"
        })
      } else {
        res.boom.badData("Login e/ou senha inválido!");
      }
    });
  } else
    res.boom.locked("Usuário sem acesso!");
});

// POST o cadastro do usuario
router.post('/cadastro', function (req, res, next) {
  var user = new Users({
    user: req.body.user,
    passwd: req.body.senha
  });
  user.save(function (err) {
    if (err) {
      console.log("Error! " + err.message);
      if (err.code === 11000)
        res.status(400).json({
          'message': "Usuario ja cadastrado!"
        });
      else if (err.message.toString().includes("`passwd` is required"))
        res.boom.badData("Senha requerida!!!");
      else if (err.message.toString().includes("`user` is required"))
        res.boom.badData("Usuario requerido!!!");
      else {
        console.log("Error! " + err.message);
        return err;
      }
    } else { // Usuario criado
      res.status(201).json("Usuario criado");
    }
  });
});

module.exports = router;