var mongoose = require('mongoose');
var $ = require('jQuery');

var helper = require('./request_helpers');
var schemas = require('../schemas');

var connection = mongoose.createConnection('mongodb://localhost/gisboard');
var Model = connection.model('Votes', schemas.ThreadSchema);

exports.initialize = function() {
};

exports.handleGet = function(req, res) {

	if( typeof req.params.id !== 'undefined') {
		
		try {
			Model.findById(req.params.id, function(err, doc) {
				helper.sendJson(req, res, doc);
			});  
		}
		catch(ex) {
			console.log(ex);
			helper.sendError(req, res, ex);
		}		
		
	} else {
		
		try {
			Model.find({}, function(err, docs) {
				  
				var elements = Array();
				$.each(docs, function(docIndex, doc) {
					elements.push(doc);
				});
				
				helper.sendJson(req, res, elements);
			});
		}
		catch(ex) {
			console.log(ex);
			helper.sendError(req, res, ex);
		}		
	}	
}


exports.handlePost = function(req, res) {
	  var vote = Model.new();
	   
	  $.extend(vote, req.body);
	  
	  try {
		  vote.save(function(err) {
			  
			  if( err ) {
				  helper.sendError(req, res, err);
				  //res.send('Server Error', {'Content-Type' : 'text/html'}, 500);
			  } else {
				  //helper.sendJson(req, res, thread, 201);
				  res.send('<div>Success!</div>');
			  }
		  });	
	  }
	  catch(ex) {
		  console.log(ex);
		  helper.sendError(req, res, ex);
	  }	  
}

exports.handleBehavior = function(req, res) {
	if( typeof(req.params.id) !== 'undefined' 
		&& Model.hasBehavior(req.params.behavior)
		&& typeof(Model.Behaviors[req.params.behavior]) === 'function') {
		
		try {
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
		}
		catch(ex) {
			console.log(ex);
			helper.sendError(req, res, ex);
		}			
	} else {
		res.send('Behavior not found: ' + req.params.behavior, {'Content-Type' : 'text/html'}, 404 );
	}	
}