var mongoose = require('mongoose');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var PostSchema = new Schema({
    thread_id  	: ObjectId
  , text     	: String 
  , username	: String
  , image_data	: String
  , timestamp  	: Date
  , upvotes		: Number
  , downvotes   : Number
  , loc   		: {lon: Number, lat: Number}
  , thread_name : String

});

var ThreadSchema = new Schema({
	name     			: String
	, loc   			: {lon: Number, lat: Number}
    , totalupvotes 		: Number
    , totaldownvotes 	: Number
    , totalposts		: Number
});

var VoteSchema = new Schema({
	post_id 	: ObjectId
	, user_id 	: String
});

ThreadSchema.index ({
	loc : '2d'
});

PostSchema.index({
	loc: '2d'
});

exports.PostSchema = PostSchema;
exports.ThreadSchema = ThreadSchema;
exports.VoteSchema = VoteSchema;
