var post_controller = require('./controller/post_controller');
var thread_controller = require('./controller/thread_controller');

function setRoutes(app, connection) {
	
	thread_controller.initialize(connection);
	post_controller.initialize(connection);
	
	app.get('/posts/:id?', post_controller.handleGet);
	app.get('/posts/:id/:behavior', post_controller.handleBehavior);
	app.post('/posts/:id?', post_controller.handlePost);
	
	app.get('/threads/:id?', thread_controller.handleGet);
	app.get('/threads/:id/:behavior', thread_controller.handleBehavior);
	app.post('/threads/:id?', thread_controller.handlePost);
}

exports.setRoutes = setRoutes;  
