var express = require('express');
var router = express.Router();
let bodyParser = require('body-parser');
let async = require('async');
var sanitizeHtml = require('sanitize-html');
var htmlspecialchars = require('htmlspecialchars');
var bcrypt = require('bcryptjs');
var multer = require('multer');
var passport = require('passport');
router.use(bodyParser.urlencoded({ extended: false }));

//MODEL
var UserModel = require("../models/userModel.js").UserModel;
//


function requireLogin (req, res, next) {
	if (!req.user) {
		res.redirect('/');
	} else {
		next();
	}
};

router.get('/', requireLogin, function(req, res, next) {
	UserModel.find({username : req.session.user.username}, (err, user)=>{
		if (err){
			console.log(err)
		}
		res.render('pages/profile', {user: user[0]});
	})
 });




router.post('/email', function(req, res){
	req.body.email = htmlspecialchars(req.body.email)
	UserModel.findOneAndUpdate( {username: req.session.user.username}, {mail: req.body.email}, {new: true},  (err, result)=>{
		if (err) res.status(200).send('une erreur de serveur est intervenue');
		else res.status(200).send('Le mail a bien été modifé');
	})
})
router.post('/pwd', function(req, res){
	req.body.pwd = htmlspecialchars(req.body.pwd)

	UserModel.findOneAndUpdate({username: req.session.user.username}, {pwd: bcrypt.hashSync(req.body.pwd)},  (err, result)=>{
		if (err) res.status(200).send('une erreur de serveur est intervenue');
		else res.status(200).send('Le Mot de Passe à bien été modifé');
	})
})
router.post('/nom', function(req, res){
	req.body.nom = htmlspecialchars(req.body.nom)
	req.body.prenom = htmlspecialchars(req.body.prenom)
	UserModel.findOneAndUpdate({username: req.session.user.username}, {nom: req.body.nom, prenom: req.body.prenom},  (err, result)=>{
		if (err) res.status(200).send('une erreur de serveur est intervenue');
		else res.status(200).send('Le Nom et Prenom à bien été modifé');
	})
})

router.post('/langue', function(req, res){
	req.body.langue = htmlspecialchars(req.body.langue)
	UserModel.findOneAndUpdate({username: req.session.user.username}, {langue: req.body.langue},  (err, result)=>{
		if (err) res.status(200).send('une erreur de serveur est intervenue');
		else res.status(200).send('La langue à été changée');
	})
})

router.post('/img', (req, res)=>{
	var storage =   multer.diskStorage({
 		destination: function (req, file, callback) {
    		callback(null, './public/img');
  		},
  		filename: function (req, file, callback) {
  			if (file.mimetype == 'image/jpeg'){
  				var	path = file.fieldname + '-' + Date.now() + '.jpg';
  				UserModel.findOneAndUpdate({username: req.session.user.username}, {img: '/img/' + path},  (err, result)=>{
  					if (err)
  						callback(err);
  					else callback(null, path)
  				})
  			} else if (file.mimetype == 'image/png'){
  				var	path = file.fieldname + '-' + Date.now() + '.png';
  				UserModel.findOneAndUpdate({username: req.session.user.username}, {img: '/img/' + path},  (err, result)=>{
  					if (err)
  						callback(err);
  					else callback(null, path)

  				})
  			} else callback('Just Png or Jpg');
  		}
	});

	var upload = multer({ storage : storage}).single('userImg');


	upload(req,res,function(err) {

		if(err) {
            return res.status(200).end("Error uploading file.");
        }
        res.status(200).end("File is uploaded");

    });
})

module.exports = router;