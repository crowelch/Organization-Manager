var mysql = require('mysql');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var params = require('../config/secrets.js').params;
var sha1 = require('sha1');
var utils = require('./utils.js');

exports.getAllowedUsers = function() {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query("SELECT doorAccessKey FROM doorAccess WHERE accessAllowed=1", function(err, result) {
			if(err) {
				reject(err);
			}

			console.log(result);
			var responseJson = {
				ids: []
			};
			_.forEach(result, function(key) {
				console.log(key);
				responseJson.ids.push(key.doorAccessKey);
			});
			console.dir(responseJson);
			resolve(responseJson);
		});

		connection.end(function(err) {
			if(err) {
				reject(err);
			}
		});
	});
};

exports.saveLog = function(log) {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query("INSERT INTO logs SET ?", log, function(err, result) {
			if(err) {
				reject(err);
			}
			resolve(result);
		});

		connection.end(function(err) {
			if(err) {
				reject(err);
			}
		});
	});
};

exports.getLogs = function() {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query("SELECT * FROM logs", function(err, result) {
			if(err) {
				reject(err);
			}
			resolve(result);
		});

		connection.end(function(err) {
			if(err) {
				reject(err);
			}
		});
	});
};

exports.registerDevice = function(card, device) {
	return new Promise(function(resolve, reject) {
		utils.hashCompare(card).then(function(result) {
			if(result === undefined) {
				reject('Member not found');
			} else {

			}
		});
	});
};
