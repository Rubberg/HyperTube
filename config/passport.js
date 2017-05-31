var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy
var Key42Strategy = require('passport-42').Strategy;

var configAuth = require('./auth.js');

var UserModel = require("../models/userModel.js").UserModel;

module.exports = function(passport){

	passport.serializeUser(function(user, done){
		done(null, user.id);
	});


	passport.deserializeUser(function(id, done){
		UserModel.findById(id, (err, user)=>{
		done(err, user);
	})
	}) 


	/*passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		
	},
	function(req, email, password, done){
		process.nextTick(function(){
			User.findOne({'local.email': email}, function(err, user){
				if (err)
					return done(err);
				if (user){
					return done(null, false, req.flash('signupMessage', 'That email already token'));
				} else {
					var newUser = new User();
					newUser.local.email = email;
					newUser.local.password = password;

					newUser.save(function(err){
						if (err)
							throw err;
						return done(null, newUser);
					})
				}
			});
		});
	}
	)) */

	passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    //passReqToCallback : true,
    profileFields: ['id', 'emails', 'name', 'photos']
  },
  function(accessToken, refreshToken, profile, done) {

  		process.nextTick(function(){
  			UserModel.findOne({'mail': profile.emails[0].value}, function(err, user){
  				if (err){
  					return done(err);
  				}
  				if (user){

  					return done(null, user);
  				}
  				else {

  					var newUser = new UserModel();
  					newUser.facebook.id = profile.id;
  					newUser.username = profile.name.givenName + '-' + profile.name.familyName;
  					newUser.nom = profile.name.familyName;
  					newUser.prenom = profile.name.givenName;
  					newUser.mail = profile.emails[0].value;
  					newUser.img = 'img/noprimpic.png';
            newUser.langue = 'ANG';

  					newUser.save(function(err){
  						if (err)
  							throw err;
  						return done(null, newUser);
  					})
  				}
  			});
  		});
  	}
	));

	passport.use('42', new Key42Strategy({
    clientID: configAuth.fortyTwoAuth.clientID,
    clientSecret: configAuth.fortyTwoAuth.clientSecret,
    callbackURL: configAuth.fortyTwoAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
   process.nextTick(function(){
  			UserModel.findOne({'mail': profile.emails[0].value}, function(err, user){
  				if (err){
  					return done(err);
  				}
  				if (user){

  					return done(null, user);
  				}
  				else {

  					var newUser = new UserModel();
            newUser.forty2.id = profile.id;
            newUser.username = profile.username;
            newUser.nom = profile.name.familyName;
            newUser.prenom = profile.name.givenName;
            newUser.mail = profile.emails[0].value;
            newUser.img = profile.photos[0].value;
            newUser.langue = 'ANG';
  					newUser.save(function(err){
  						if (err)
  							throw err;
  						return done(null, newUser);
  					})
  				}
  			});
  		});
    }
  ))


};