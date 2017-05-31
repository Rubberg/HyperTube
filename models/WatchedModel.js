var mongoose = require("mongoose");

var Watched_Schema = new mongoose.Schema({
  		username : { type : String },
        movieId : String,
});


var WatchedModel = mongoose.model('NewWatched', Watched_Schema);

module.exports = {
  WatchedModel: WatchedModel
}