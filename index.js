var router = require('./router');
var server = require('./server');
var fs = require('fs');
var crypto = require('crypto');

var keys = {
	key : fs.readFileSync('/var/fixtures/keys/bitwise-key.pem'),
	cert: fs.readFileSync('/var/fixtures/keys/bitwise-cert.pem')
};

server.start(router, 80, crypto.randomBytes(48).toString('hex'));
server.startSecure(router, 443, keys, crypto.randomBytes(48).toString('hex'));

