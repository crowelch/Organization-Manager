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
};

exports.insert = function(queryString, queryObject) {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query(queryString, queryObject, function(err, result) {
			if(err) {
				console.log('sql insert err', err.code);
				if(err.code === 'ER_DUP_ENTRY') {
					reject({
						accountexists: true
					});
				} else {
					reject(err);
				}
			} else {
				console.log('result', result);
				resolve(result);
			}
		});

		connection.end(function(err) {
			if(err) {
				console.log(err);
			}
		});
	});
};

exports.update = function(queryString) {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query(queryString, function(err, result) {
			if(err) {
				console.log('sql update err', err.code);
				reject(err);
			} else {
				resolve(result);
			}
		});

		connection.end(function(err) {
			if(err) {
				console.log(err);
			}
		});
	});
};

exports.escape = mysql.escape;
