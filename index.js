var router = require('./router');
var server = require('./server');
var fs = require('fs');

var keys = {
	key : fs.readFileSync('/var/fixtures/keys/bitwise-key.pem'),
	cert: fs.readFileSync('/var/fixtures/keys/bitwise-cert.pem')
};

server.start(router, 80, "kIfdj*6saJ*d2KHas2rciJDFweud:EAJdhsdd8ff");
server.startSecure(router, keys, 443, "kKDDUkdfIafkhjw_uw8@*kshakPQasdjAAQWehf");

