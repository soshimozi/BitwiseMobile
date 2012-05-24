var express = require('express');
var https = require('https');
var RedisStore = require('connect-redis')(express);
var fileRoot = '/var/node/bitwise/files';
var jqtpl = require("jqtpl");

var fs = require('fs');

var options = {
	key : fs.readFileSync('/tmp/fixtures/keys/bitwise-key.pem'),
	cert: fs.readFileSync('/tmp/fixtures/keys/bitwise-cert.pem')
};

var app = express.createServer(options);
var app2 = express.createServer();

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: "kiKADw&dk!slk3", store: new RedisStore }));

app.post('/add-to-cart', function(req, res) {
var items = req.body.items;
req.session.items = items;
res.redirect('back');
});

app.get('/', function(req, res) {
	res.send('hello world from secure server');
});

function serveFile(res, file, fullpath) {
	if( fullpath === true ) {
		res.send("test okay!");
	 } else {
		res.send("");
	}
}

app2.get('/files(/*)?', function(req, res) {

	var file = req.params[0];
	if( file  == undefined ) {
		res.send('No such file.');
		return;
	}

	var path = fileRoot + file;

	console.log('Opening file: ' + path);
	try {
		var data = fs.readFileSync(path, 'utf-8');
		//res.send(jqtpl.tmpl(data));
		serveFile(res, path, true);
		console.log(data);
	}
	catch (err) {
  		console.error("There was an error opening the file:");
		console.log(err);
	}

});

app2.get('/files', function(req, res) {
	res.send('');
});
app.listen(443);

console.log('Secure server listening on 443');



app2.get('/', function(req, res){
	res.send('hello world');
});

app2.listen(80);
console.log('Non-Secure server listening on 80');
