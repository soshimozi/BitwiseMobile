var Model = null;
var Behaviors = {};

exports.initialize = function(connection, name, schema) { 
	Model = connection.model(name, schema);
}

exports.new = function() { 
	return new Model; 
}

exports.findAll = function(callback){

    Model.find({}, callback);
}

exports.findById = function(id, callback) {
	Model.findById(id, callback);
}

exports.find = function(query, callback) { 
	Model.find(query, callback);
}

exports.registerBehavior = function(name, callback) {
	if (typeof(Behaviors[name]) === 'undefined') {
		Behaviors[name] = callback;
	}  // else allow chaining?
}

exports.hasBehavior = function(name) {
	return typeof(Behaviors[name] !== 'undefined');
}

exports.Behaviors = Behaviors;
exports.Model = Model;