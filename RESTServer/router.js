var post_controller = require('./controller/post_controller');
var thread_controller = require('./controller/thread_controller');
var api_controller = require('./controller/api_controller');
var vote_controller = require('./controller/vote_controller');

function setRoutes(app) {
	
	thread_controller.initialize();
	post_controller.initialize();
	api_controller.initialize();
	
	app.get('/posts/:id?', post_controller.handleGet);
	app.get('/posts/:id/:behavior', post_controller.handleBehavior);
	app.post('/posts/:id?', post_controller.handlePost);
	
	app.get('/threads/:id?', thread_controller.handleGet);
	app.get('/threads/:id/:behavior', thread_controller.handleBehavior);
	app.post('/threads/:id?', thread_controller.handlePost);
	
	app.get('/votes/:id?', vote_controller.handleGet);
	app.get('/votes/:id/:behavior', vote_controller.handleBehavior);
	app.post('/votes/:id?', vote_controller.handlePost);
	
	app.get('/:command', api_controller.handleGet);
}

exports.setRoutes = setRoutes;  
