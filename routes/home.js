var express = require('express');
var router = express.Router();
let bodyParser = require('body-parser');

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
			// console.log(err)
		}
		res.render('pages/home', {user: user[0].username, img: user[0].img});

	})
 });

router.get('/test', (req, res)=> {
    res.end();
})

module.exports = router