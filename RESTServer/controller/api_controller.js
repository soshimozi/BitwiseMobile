var mongoose = require('mongoose');
var util = require('util');
var $ = require('jQuery');

var helper = require('./request_helpers');
var schemas = require('../schemas.js');

var connection = mongoose.createConnection('mongodb://localhost/gisboard');
var PostModel = connection.model('Posts', schemas.PostSchema);
var ThreadModel = connection.model('Threads', schemas.ThreadSchema);

exports.initialize = function() {
};  

exports.handleGet = function(req, res) {

	//console.log(req);

	if( req.params.command == 'closest_threads' ) { 
		
		// convert range to radian distance measurement
		var range = parseFloat(req.query.range) / 1000 / 111.2;
		
		console.log("finding distance: " + range);
		
		ThreadModel.find(
				{  
					loc : { 
						$near : [parseFloat(req.query.lon), parseFloat(req.query.lat)], 
						$maxDistance: range 
					} 
				}, 
				function(err, docs) {
					
					if( !err ) {
						
						var elements = Array();
						$.each(docs, function(docIndex, doc) {
							elements.push(doc);
						});
						
						helper.sendJson(req, res, elements);

					} else {
						helper.sendError(req, res, err);
					}
				});
		
	} else if (req.params.command == 'add_thread' ) {
		
		  var thread = new ThreadModel;
		  $.extend(thread, req.query);
		  
		  var range = 25 / 1000 / 111.2;
		  
		  // see if a thread exists in that area with that name first
		  ThreadModel.find(
				{  
					loc : { 
						$near : [parseFloat(req.query.loc.lon), parseFloat(req.query.loc.lat)], 
						$maxDistance: range 
					},
				
					name : req.query.name
				}, 
				function(err, docs) {
					
					if( !err && docs.length > 0) {
						
						helper.sendJson(req, res, { result: 'failed', error: 'Duplicate Place' } );

					} else {
						
						if( err ) {
							console.log(err);
						}
							
						  thread.save(function(err) {
							  if( err ) {
								  helper.sendJson(req, res, { result: 'failed', error: err } );
							  } else {
								  helper.sendJson(req, res, { result: 'success', record: thread });
							  }
						  });
					}
				});
		  
	} else if (req.params.command == 'add_post' ) { 
		  ThreadModel.find(
					{  
						_id : req.query.thread_id
					}, 
					function(err, docs) {
						
						if( !err && docs.length == 0) {
							
							helper.sendJson(req, res, { result: 'failed', error: 'Invalid thread id' } );

						} else {  
							
							if( err ) {
								helper.sendError(req, res, err);
							} else {
							
								var post = new PostModel;
								var thread = docs[0];
								
								console.log(post);
								
								$.extend(post, req.query);
								
								var timestamp = post._id.toString().substring(0,8)
								var date = new Date( parseInt( timestamp, 16 ) * 1000 )
								
								post.timestamp = date;
								
								console.log(thread);
								
								thread.posts.push(post);

								console.log(thread);
								 
								thread.save(function(err) {
						 			if( err ) {
										helper.sendJson(req, res, { result: 'failed', error: err } );
									} else {
										helper.sendJson(req, res, { result: 'success', record: post });
									}
								});
							}

						}
					}
		);
		
	} else {
		res.send('Not found: ' + req.params.command, {'Content-Type' : 'text/html'}, 404);
	}
}

exports.handlePost = function(req, res) {
	// TODO: return meaningful, like protocol not supported
	res.send('Server Error', {'Content-Type' : 'text/html'}, 500);
}

exports.handleBehavior = function(req, res) {
	res.send('Behavior not found: ' + req.params.behavior, {'Content-Type' : 'text/html'}, 404 );
}