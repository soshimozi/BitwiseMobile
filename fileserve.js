var fs = require('fs');

function serveFile(res, file) {
	res.send( fs.readFileSync(file, 'utf-8') );
}

exports.serveFile = serveFile;
