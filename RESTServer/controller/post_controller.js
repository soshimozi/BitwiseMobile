var $ = require('jQuery');

var helper = require('./request_helpers');
var schemas = require('../schemas');

var connection = mongoose.createConnection('mongodb://localhost/gisboard');
var Model = connection.model('Posts', schemas.PostSchema);

exports.initialize = function() {
};

exports.handleGet = function(req, res) { 
	if( typeof req.params.id !== 'undefined') {
		Model.findById(req.params.id, function(err, doc) {
			res.send(doc);
		});
		
	} else {
		Model.findAll(function(err, docs) {
			var elements = Array();
			for(docIndex in docs) {
				elements.push(docs[docIndex]);
			}
			
			res.send(elements);
		});
	}	
}


exports.handlePost = function(req, res) {
	  //res.send('Got a post request: ' + util.inspect(req.body) + ', name: ' + req.body.name);
	  
	  var post = Model.new();
	   
	  //post.name = req.body.name;
	  //post.loc = [req.body.location.lng, req.body.location.lat];
	  
	  $.extend(post, req.body);
	  
	  post.save(function(err) {
		  
		  if( err ) {
			  console.log(err);
			  res.send('Server Error', {'Content-Type' : 'text/html'}, 500);
		  } else {
			  res.send(post, {'Content-Type' : 'Application/json'}, 201);
		  }
	  });
}

exports.handleBehavior = function(req, res) {
	if( typeof(req.params.id) !== 'undefined' 
		&& Model.hasBehavior(req.params.behavior)
		&& typeof(Model.Behaviors[req.params.behavior]) === 'function') {
		
		Model.findById(req.params.id, function(err, doc) {
				
				if( err ) {
					console.log(err);
					res.send('Server Error', { 'Content-Type': 'text/html' }, 500);
				} else if( doc ) {
					Model.Behaviors[req.params.behavior](req, res, doc);
				} else {
					res.send('Post not found', { 'Content-Type': 'text/html' }, 404);
				}
				
			});
			
	} else {
		res.send('Behavior not found: ' + req.params.behavior, {'Content-Type' : 'text/html'}, 404 );
	}	
}