var express = require('express');
var router = express.Router();
let bodyParser = require('body-parser');
let async = require('async');
var sanitizeHtml = require('sanitize-html');
var bcrypt = require('bcryptjs');
var multer = require('multer');

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


router.get('/', function(req, res, next) {
	UserModel.find({}, function(err, users) {
    if (!err){ 
        res.render('pages/profileList', {users: users});

    } else {throw err;}
});
  
});

module.exports = router;