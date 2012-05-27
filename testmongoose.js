var mongoose = require('mongoose');

console.log('tst');

mongoose.connect('mongodb://gisboard_user:kdiA3d@dk/gisboard');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var posts = new Schema({
  threadid : ObjectId
  , title     : String
  , body      : String
  , image_url : String
  , image_url_type : {type: String, enum: ['Data', 'Link'], default: 'Data'}
  , timestamp : Date
});

var threads = new Schema({
  name      : String
  , post     : String
  , timestamp : Date
  , posts : [posts]
  , meta : {
      ratings : [Number]
      , faves : Number
  }
  , location : {lng:Number, lat:Number}
});

threads.index ({
    location : '2d'
});


var ThreadsModel = mongoose.model('threads', threads);

var thread = new ThreadsModel( { name: 'blah'} );
thread.save( function(err) {
	if( err ) {
		console.log(err);
	} else {
		console.log('saved!');
		console.log(thread.id);
	}
});

