var mongoose = require("mongoose");

var Comment_Schema = new mongoose.Schema({
    username : { type : String },
    img : String,
    movie : String,
    comment : String
});
w