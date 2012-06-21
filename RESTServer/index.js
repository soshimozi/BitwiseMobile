var fs 		= require('fs');
var crypto 	= require('crypto');

var router 	= require('./router');
var server 	= require('./server');

var httpserver = server.create(
		{ 
			use_ssl: false, 
			session: { 
				enabled: true, 
				key: crypto.randomBytes(48).toString('hex') 
			}
		}
	);

router.setRoutes(httpserver);

var config = {
	http_port: 80,
	https_port: 443
};

httpserver.listen(config.http_port);
console.log('Http server listening on port ' + config.http_port);

