var mongoose = require('mongoose');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var ThreadSchema = new Schema({
    post_id  : ObjectId
  ,  text     : String
});

var PostSchema = new Schema({
	name     : String
  , location      : {lng: Number, lat: Number}
  , timestamp  : Date
  , threads  : [ThreadSchema]
  , meta      : { rating : [Number] }
});

PostSchema.index ({
	location : '2d'
});

exports.PostSchema = PostSchema;
exports.ThreadSchema = ThreadSchema;
