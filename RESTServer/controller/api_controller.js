var mongoose = require('mongoose');
var util = require('util');
var $ = require('jQuery');
var crypto = require('crypto')
, shasum = crypto.createHash('sha1');

var helper = require('./request_helpers');
var schemas = require('../schemas.js');

var connection = mongoose.createConnection('mongodb://localhost/gisboard');
var PostModel = connection.model('Posts', schemas.PostSchema);
var ThreadModel = connection.model('Threads', schemas.ThreadSchema);
var VoteModel = connection.model('Votes', schemas.VoteSchema);

var salt = "FA8E208AB0DC0078EA04F0E0AD";

var addPost = function(req, res) {
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
								
								$.extend(post, req.query);
								
								var timestamp = post._id.toString().substring(0,8)
								var date = new Date( parseInt( timestamp, 16 ) * 1000 )
								
								post.timestamp = date; 
								post.upvotes = 0;
								post.downvotes = 0; 
								post.thread_id = thread._id;
								post.thread_name = thread.name;
								post.loc = {"lon" : parseFloat(thread.loc.lon), "lat" : parseFloat(thread.loc.lat)};

								post.save(function(err) {
						 			if( err ) {
						 				console.log(err);
										helper.sendJson(req, res, { result: 'failed', error: err } );
									} else {
									
										thread.totalposts++;
										thread.save(function(err) {
								 			if( err ) {
								 				console.log(err);
												helper.sendJson(req, res, { result: 'failed', error: err } );
											} else {
												helper.sendJson(req, res, { result: 'success', record: post });
											}
										});
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
}

var addThread = function(req, res) {
  var thread = new ThreadModel;
  $.extend(thread, req.query, {totalupvotes: 0, totaldownvotes: 0, totalposts: 0});
  
  var range = 50 / 6378;
  
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
}

var handleClosestThreads = function(req, res) {

	// convert range to radian distance measurement
	var range = parseFloat(req.query.range) / 6378;
	
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
	
}

var getUserVoted = function(user_id, post_id, fn_callback) {
	VoteModel.find(
			{
				post_id: post_id,
				user_id: user_id
			}, 
			function(err, docs) {
				
				if( !err ) {

					fn_callback(docs.length > 0 ? true : false);

				} else {
					console.log(err);
					helper.sendError(req, res, err);
				}
			});				
}

var handlePostsForThread = function(req, res) {
	
	// first get all votes for a user
	VoteModel.find(
		{
			user_id: req.query.device_id
		}, 
		function(err, docs) {
			
			if( !err ) {
				
				var uservotes = Array();
				
				// build map of user to post
				$.each(docs, function(docIndex, doc) {
					console.log(doc);
					uservotes[doc.post_id] = doc; 
				});
				  
				PostModel.find(
						{  
							thread_id : req.query.thread_id   
						}, 
						function(err, docs) {
							
							if( !err ) {
								
								var elements = Array();
								$.each(docs, function(docIndex, doc) {
									
									console.log(doc);
									
									
									var voted = doc._id in uservotes;
									console.log(voted);
									
									var newDoc = {
										post: doc,
										voted: voted
									};
									
									elements.push(newDoc);
								});
								
								helper.sendJson(req, res, elements);

							} else {
								helper.sendError(req, res, err);
							}
						});			
				
			} else {
				helper.sendError(req, res, err);
			}
		});				
}

var handleAllPosts = function(req, res) {
	
	// convert range to radian distance measurement
	var range = parseFloat(req.query.range) / 6378;
	var sort = 'recent';  
	
	if( req.query.sort ) {
		sort = req.query.sort;
	}
	
	// 
	// get all post ids that user voted on, add to associated array
	// extend each object by looking up post id, if in array then add true, otherwise add false
	// first get all votes for a user
	VoteModel.find(
		{
			user_id: req.query.device_id
		}, 
		function(err, docs) {
			
			if( !err ) {
				
				var uservotes = Array();
				
				// build map of user to post
				$.each(docs, function(docIndex, doc) {
					console.log(doc);
					uservotes[doc.post_id] = doc; 
				});
				
				PostModel.find(
					{  
						loc : { 
							$near : [parseFloat(req.query.lon), parseFloat(req.query.lat)], 
							$maxDistance: range 
						}  
					}).execFind(   
					function(err, docs) {
						
						if( !err ) {
							
							var elements = Array();
							$.each(docs, function(docIndex, doc) {

								console.log(doc);
								
								var voted = doc._id in uservotes;

								var newDoc = {
									post: doc,
									voted: voted
								};
								
								elements.push(newDoc);
							});
							
							
							var qsort = function(a, fn_compare) {
							    if (a.length == 0) return [];
							 
							    var left = [], right = [], pivot = a[0];
							 
							    for (var i = 1; i < a.length; i++) {
							    	if( sort == 'top-rated' ) {

							    		var a_votes = a[i].post.upvotes - a[i].post.downvotes;
							    		var p_votes = pivot.post.upvotes - pivot.post.downvotes;
							    		
							    		a_votes > p_votes ? left.push(a[i]) : right.push(a[i]);
							    		
							    	} else {
							    		Date.parse(a[i].post.timestamp) > Date.parse(pivot.post.timestamp) ? left.push(a[i]) : right.push(a[i]);
							    	}
							    }
							 
							    return qsort(left).concat(pivot, qsort(right));
							}
							
							helper.sendJson(req, res, qsort(elements));
							
						} else {
							helper.sendError(req, res, err);
						}
					});
				
				
			} else {
				helper.sendError(req, res, err);
			}
		}
	);
	
}

var handleVoteDown = function(req, res) {
	
	console.log('deviceid: ' + req.query.deviceid);
	
    // first see if we have voted for this post yet
	VoteModel.find(
			{
				user_id: req.query.deviceid,
				post_id: req.query.postid
			}, 
			function(err, docs) {
				if( err ) {
					helper.sendError(req, res, err);
				} else {
	
					if( docs.length > 0 ) {
						helper.sendJson(req, res, { result: 'failed', error: 'Already voted.' } );					
					} else {
					    PostModel.find(
					    		{  
									_id : req.query.postid
								}, 
								function(err, docs) {
									
									if( err ) {
										helper.sendError(req, res, err);
									} else {
										if( docs.length == 0) {
	
											helper.sendJson(req, res, { result: 'failed', error: 'Invalid post id' } );
						
										} else {
											
											var post = docs[0];
											post.downvotes = post.downvotes + 1;
											
											console.log(post);
											
											post.save(function(err) {
												if( err ) {
													helper.sendJson(req, res, { result: 'failed', error: err } );
												} else {
													
													var vote = new VoteModel;
													vote.user_id = req.query.deviceid;
													vote.post_id = docs[0]._id;
													
													console.log(vote);
													
													vote.save(function(err) {
														
															// TODO: rollback post save?
														  if( err ) {
															  helper.sendJson(req, res, { result: 'failed', error: err } );
														  } else {
															  helper.sendJson(req, res, { result: 'success', record: vote });
														  }
													  });
													
												}
												
											});
											
										}
									}
								}
						);
						
					}
				}
			}
	);
}

var handleVoteUp = function(req, res) {
	console.log('deviceid: ' + req.query.deviceid);
	
    // first see if we have voted for this post yet
	VoteModel.find(
			{
				user_id: req.query.deviceid,
				post_id: req.query.postid
			}, 
			function(err, docs) {
				if( err ) {
					helper.sendError(req, res, err);
				} else {
	
					if( docs.length > 0 ) {
						helper.sendJson(req, res, { result: 'failed', error: 'Already voted.' } );					
					} else {
					    PostModel.find(
					    		{  
									_id : req.query.postid
								}, 
								function(err, docs) {
									
									if( err ) {
										helper.sendError(req, res, err);
									} else {
										if( docs.length == 0) {
	
											helper.sendJson(req, res, { result: 'failed', error: 'Invalid post id' } );
						
										} else {
											
											var post = docs[0];
											post.upvotes = post.upvotes + 1;
											
											console.log(post);
											
											post.save(function(err) {
												if( err ) {
													helper.sendJson(req, res, { result: 'failed', error: err } );
												} else {
													
													var vote = new VoteModel;
													vote.user_id = req.query.deviceid;
													vote.post_id = docs[0]._id;
													
													console.log(vote);
													
													vote.save(function(err) {
														
															// TODO: rollback post save?
														  if( err ) {
															  helper.sendJson(req, res, { result: 'failed', error: err } );
														  } else {
															  helper.sendJson(req, res, { result: 'success', record: vote });
														  }
													  });
													
												}
												
											});
											
										}
									}
								}
						);
						
					}
				}
			}
	);
}

exports.initialize = function() {
};  

exports.handleGet = function(req, res) {

	console.log(req.query);
	
	var methods = {};
	
	methods['all_posts'] = handleAllPosts;
	methods['closest_threads'] = handleClosestThreads;
	methods['add_thread'] = addThread;
	methods['add_post'] = addPost;
	methods['vote_up'] = handleVoteUp;
	methods['vote_down'] = handleVoteDown;
	methods['posts_for_thread'] = handlePostsForThread;
	
	if( typeof methods[req.params.command] === 'function' ) {
		methods[req.params.command](req, res);
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