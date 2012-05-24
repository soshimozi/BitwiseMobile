var path = require('path');
var fileserve = require('./fileserve');

var ROOTPATH = '/var/node/bitwise/files/';

function routeStylesheets(req, res) {
	var file = req.params[0];
	if (file != undefined) {
		file = file.replace(/^\//g, '');
	}

	var fullPath = ROOTPATH + file;
	if (file == undefined || file == '' || !path.existsSync(fullPath)) {
		res.send('No such file');
	} else {
		res.contentType('text/css');
		fileserve.serveFile(res, fullPath);
	}
}

function routeScripts(req, res) {
	var file = req.params[0];
	if (file != undefined) {
		file = file.replace(/^\//g, '');
	}

	var fullPath = ROOTPATH + file;
	if( file == undefined || file == '' || !path.existsSync(fullPath)) {
		res.send('No such file.');
	} else {
		res.contentType('text/javascript');
		fileserve.serveFile(res, fullPath);
	}
}

function routeFiles(req, res) {
	var file = req.params[0];

	if (file != undefined) {
		file = file.replace(/^\//g, '');
	}

	var fullPath = ROOTPATH + file;
	if( file == undefined || file == '' || !path.existsSync(fullPath)) {
		res.send('No such file.');
	} else {
		console.log('File: ' + fullPath);
		fileserve.serveFile(res, fullPath);
	}
}

function setRoutes(app) {
	app.get('/files(/*)?', routeFiles);
	app.get('/scripts(/*)?', routeScripts);
	app.get('/stylesheets(/*)?', routeStylesheets);
}

exports.setRoutes = setRoutes;
