var express = require('express');
var RedisStore = require('connect-redis')(express);

function setMiddleware(server, options) {
	
	server.use(express.bodyParser());
	server.use(express.cookieParser());

	if( options.session.enabled ) {
		server.use(express.session({secret: options.session.key, store: new RedisStore }));
	}
}

exports.create = function(options) {

	var server;
	 
	if( options.use_ssl ) {
		server = express.createServer(options.ssl_config);
	} else {
		server = express.createServer();
	}
	
	setMiddleware(server, options);
	
	return server;
} 

