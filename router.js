var path = require('path');
var fileserve = require('./fileserve');

var ROOTPATH = '/var/node/bitwise/files/';


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

function getPlaces(req, res) {
	res.send('test okay');
}

function getPosts(req, res) {
	res.send('test okay');
}

function postPlaces(req, res) {
	res.send('test okay');
}

function postPosts(req, res) {
	res.send('test okay');
}

function setRoutes(app) {
	
	app.get('/places/:id?', getPlaces);
	app.get('/places/:id/:operation', getPlaces);
	app.get('/posts/:id?', getPosts);
	app.get('/posts/:id/:operation', getPosts);
	
	app.post('/places/:id?', postPlaces);
	app.post('/posts/:id?', postPosts);
	
	//app.get('/files(/*)?', routeFiles);
}

exports.setRoutes = setRoutes;
