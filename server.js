var express = require('express');
var https = require('https');

var RedisStore = require('connect-redis')(express);
var jqtpl = require('jqtpl');

function setMiddleware(app, session_key) {
	
	app.use(express.bodyParser());
	app.use(express.cookieParser());

	if( session_key != undefined ) {
		app.use(express.session({secret: session_key, store: new RedisStore }));
	}
}

function startSecure(router, keys, port, session_key) {

	var app = express.createServer(keys);

	setMiddleware(app, session_key);
	router.setRoutes(app);
	app.listen(port);

	console.log('Secure server listening on port ' + port);
}

function start(router, port, session_key) {

	var app = express.createServer();

	setMiddleware(app, session_key);
	router.setRoutes(app);
	app.listen(port);

	console.log('Server listening on port ' + port);
}

exports.start = start;
exports.startSecure = startSecure;

