var mongoose = require("mongoose");

var Comment_Schema = new mongoose.Schema({
  			username : { type : String },
        img : String,
        movie : String,
  			comment : String
});


var CommentModel = mongoose.model('NewComment', Comment_Schema);

module.exports = {
  CommentModel: CommentModel
}