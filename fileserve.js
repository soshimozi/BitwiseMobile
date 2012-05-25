var fs = require('fs');
var mime = require('mime');

mime.define({'text/html': ['mhtml'],
			 'text/css' : ['css'],
			 'text/javascript' : ['js']
 	});

function serveFile(res, path) {
	
	fs.readFile(path, function(err, data) {

		if( !err ) {
			res.writeHead(200, {"Content-Type": mime.lookup(path)});
		} else {
	        data = "404 Not Found";
	        res.writeHead(404, {"Content-Type": "text/plain"});
		}
	
		res.write(data);
		res.end()
	});
}

exports.serveFile = serveFile;
