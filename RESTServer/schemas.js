var mongoose = require('mongoose');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var PostSchema = new Schema({
    thread_id  	: ObjectId
  , text     	: String 
  , username	: String
  , timestamp  	: Date
  , upvotes		: Number
  , downvotes   : Number
});

var ThreadSchema = new Schema({
	name     	: String
	, posts  		: [PostSchema]
	, loc   		: {lon: Number, lat: Number}
});

ThreadSchema.index ({
	loc : '2d'
});

exports.PostSchema = PostSchema;
exports.ThreadSchema = ThreadSchema;
