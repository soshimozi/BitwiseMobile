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

	if( req.params.command == 'all_posts' ) { 
		
		// convert range to radian distance measurement
		var range = parseFloat(req.query.range) / 1000 / 11.2;
		
		try  {
			ThreadModel.find(
				{  
					loc : { 
						$near : [parseFloat(req.query.lon), parseFloat(req.query.lat)], 
						$maxDistance: range 
					}  
				},  ['posts']).execFind(  
				function(err, docs) {
					
					if( !err ) {
						
						var elements = Array();
						$.each(docs, function(docIndex, doc) {
							elements = elements.concat(doc.posts);
						});
						
						
						var qsort = function(a) {
						    if (a.length == 0) return [];
						 
						    var left = [], right = [], pivot = a[0];
						 
						    for (var i = 1; i < a.length; i++) {
						       Date.parse(a[i].timestamp) > Date.parse(pivot.timestamp) ? left.push(a[i]) : right.push(a[i]);
						    }
						 
						    return qsort(left).concat(pivot, qsort(right));
						}
						
						//elements = qsort(elements);
						
						helper.sendJson(req, res, qsort(elements));

					} else {
						helper.sendError(req, res, err);
					}
				});
		}
		catch(ex) {
			console.log(ex);
			helper.sendError(req, res, ex);
		}
		
	} else if( req.params.command == 'closest_threads' ) { 
		
		// convert range to radian distance measurement
		var range = parseFloat(req.query.range) / 1000 / 11.2;
		
		console.log("finding distance: " + range);
		
		try  {
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
		}
		catch(ex) {
			console.log(ex);
			helper.sendError(req, res, ex);
		}
		
	} else if (req.params.command == 'add_thread' ) {
		
		  var thread = new ThreadModel;
		  $.extend(thread, req.query);
		  
		  var range = 25 / 1000 / 111.2;
		  
		  try {
			  
			if( req.query.name.length == 0 ) {
				helper.sendJson(req, res, { result: 'failed', error: 'Name field cannot be blank.' } );
			} else {
		  
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
									helper.sendError(req, res, err);
								} else {
									  thread.save(function(err) {
										  if( err ) {
											  helper.sendJson(req, res, { result: 'failed', error: err } );
										  } else {
											  helper.sendJson(req, res, { result: 'success', record: thread });
										  }
									  });
								}
							}
						});
				}
			}
			catch(ex) {
				console.log(ex);
				helper.sendError(req, res, ex);
			}
		  
	} else if (req.params.command == 'add_post' ) {
		try {
			
			if( req.query.text.length == 0 ) {
				helper.sendJson(req, res, { result: 'failed', error: 'Text field cannot be blank.' } );
			} else {
			
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
						});
			}
		}
		catch(ex) {
			console.log(ex);
			helper.sendError(req, res, ex);
		}		  
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