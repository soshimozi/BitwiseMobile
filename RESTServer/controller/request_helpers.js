var JSON = require('JSON');

exports.sendJson = function(req, res, obj, status) {
	
	if( typeof(req.query.callback) !== 'undefined' ) {
		// handle jsonp
		res.send(req.query.callback + '(' + JSON.stringify(obj) + ');', {'Content-Type': 'text/javascript'}, 200);							
	} else {
		
		if( typeof(status) === 'undefined') {
			status = 200;
		}
		
		// handle regular json
		res.send(obj, {'Content-Type': 'application/json' }, status);
	}
	
}


exports.sendError = function(req, res, err) {
	res.send('Server Error', {'Content-Type': 'text/html'}, 500);
	console.log(err);
}