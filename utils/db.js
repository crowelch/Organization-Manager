var mysql = require('mysql');
var Promise = require('es6-promise').Promise;
var params = require('../config/secrets.js').params;


exports.select = function(queryString) {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query(queryString, function(err, result) {
			if(err) {
				reject(err);
			}
			resolve(result);
		});

		connection.end(function(err) {
			if(err) {
				console.log(err);
			}
		});
	});
}
