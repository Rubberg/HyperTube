var express = require('express');
var router = express.Router();
let bodyParser = require('body-parser');
let async = require('async');
var sanitizeHtml = require('sanitize-html');
let bcrypt = require('bcryptjs');

//MODEL
var UserModel = require("../models/userModel.js").UserModel;
//

router.use(bodyParser.urlencoded({ extended: false }));


router.get('/', function(req, res, next) {
  res.render('pages/inscription', {});

});

router.post('/inscription', (req, res)=>{

let email = sanitizeHtml(req.body.email);
let username = sanitizeHtml(req.body.pseudo);
let nom = sanitizeHtml(req.body.nom);
let prenom = sanitizeHtml(req.body.prenom);
let pawd = bcrypt.hashSync(req.body.pwd);
let geo = JSON.parse(req.body.geo);

let location = {lat: geo.lat, lon: geo.lon}


async.waterfall([
	function(callback){
		UserModel.find({mail : email}, (err, query)=>{
			if (err) return callback(err);
			else return callback(null, query);
		})
	},
	function(mail, callback){
		UserModel.find({username : username}, (err, query)=>{
			if (err) return callback(err)
			else return callback(null, mail, query);
		})
	},
	function(mail, pseudo, callback){
		if (mail.length)
			return callback('Dsl quelqu utilijse ce mail');
		else if (pseudo.length)
			return callback('Dsl quelqu utilise ce pseudo')

		else{
			var NewUser = new UserModel({ username : username, pwd : pawd, mail: email, nom: nom, prenom: prenom, langue: 'ang', img: 'img/noprimpic.png'});

			NewUser.save(function (err) {
  				if (err) return callback(err);
				return callback(null, 'TU es enregistre');
			});
		}
	}
	], (err, resultFinal)=>{
		if (err) return res.status(200).send(err);
		else return res.status(200).send(resultFinal);
	});
})

module.exports = router;
