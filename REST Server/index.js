var fs 		= require('fs');
var crypto 	= require('crypto');

var router 	= require('./router');
var server 	= require('./server');
var cm 		= require('./connection_manager');

var httpserver = server.create(
		{ 
			use_ssl: false, 
			session: { 
				enabled: true, 
				key: crypto.randomBytes(48).toString('hex') 
			}
		}
	);

var httpsserver = server.create(
		{
			use_ssl: true,
			ssl_config: {
				key : fs.readFileSync('/var/fixtures/keys/bitwise-key.pem'),
				cert: fs.readFileSync('/var/fixtures/keys/bitwise-cert.pem')
			},
			session : { 
				enabled: true, 
				key: crypto.randomBytes(48).toString('hex') 
			}
		}
	);

cm.addConnection('gisboard', 'gisboard');

router.setRoutes(httpserver, cm.getConnection('gisboard'));
router.setRoutes(httpsserver, cm.getConnection('gisboard'));

var config = {
	http_port: 80,
	https_port: 443
};

httpserver.listen(config.http_port);
console.log('Http server listening on port ' + config.http_port);

httpsserver.listen(config.https_port);
console.log('Https server listening on port ' + config.https_port);


