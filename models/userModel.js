var mongoose = require("mongoose");

var User_Schema = new mongoose.Schema({
  			username : { type : String },
  			nom : { type : String },
  			prenom : { type : String },
  			langue: String,
  			pwd : String,
  			mail : String,
  			date : { type : Date, default : Date.now },
  			img : String,
  			facebook: {
  				id: String,
  				token: String,
  				email: String,
  				name: String
  			},
        forty2: {
          id: String,
          token: String,
          name: String,
          email: String
        }
});


var UserModel = mongoose.model('NewUser', User_Schema);

module.exports = {
  UserModel: UserModel
}