var express = require('express');
var RedisStore = require('connect-redis')(express);

function setMiddleware(server, session_key) {
	
	server.use(express.bodyParser());
	server.use(express.cookieParser());

	if( session_key != undefined ) {
		server.use(express.session({secret: session_key, store: new RedisStore }));
	}
}

function startSecure(router, port, keys, session_key) {

	var server = express.createServer(keys);

	setMiddleware(server, session_key);
	router.setRoutes(server);
	server.listen(port);

	console.log('Secure server listening on port ' + port);
}

function start(router, port, session_key) {

	var server = express.createServer();

	setMiddleware(server, session_key);
	router.setRoutes(server);
	server.listen(port);

	console.log('Server listening on port ' + port);
}

exports.start = start;
exports.startSecure = startSecure;

