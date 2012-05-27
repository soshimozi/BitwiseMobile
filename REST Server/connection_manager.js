var mongoose = require('mongoose');

var connection_map = {};

exports.getConnection = function (key) {
	
	if ( typeof(connection_map[key]) !== 'undefined' && connection_map[key] != null ) {
		return connection_map[key]; 
	}
	
	return null;
}

exports.addConnection = function(key, dbname) {
	
	if ( typeof(connection_map[key]) === 'undefined' || connection_map[key] == null ) {
		var connection = mongoose.createConnection('mongodb://localhost/'+dbname);
		connection_map[key] = connection;
	}
}
