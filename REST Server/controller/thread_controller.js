var schemas = require('../schemas');
var Model = require('../model/model');

exports.initialize = function(connection) {
	Model.initialize(connection, 'Threads', schemas.ThreadSchema);
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
				Model.Behaviors[req.params.behavior](doc, function(err, results) {
					res.send(results, { 'Content-Type': 'Application/json' }, 200);
				});
				
			} else {
				res.send('Post not found', { 'Content-Type': 'text/html' }, 404);
			}
		});
			
	} else {
		res.send('Behavior not found: ' + req.params.behavior, {'Content-Type' : 'text/html'}, 404 );
	}	
}