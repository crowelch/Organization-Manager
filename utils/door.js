var mysql = require('mysql');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var params = require('../config/secrets.js').params;
var sha1 = require('sha1');
var utils = require('./utils.js');
var fs = require('fs');
var md5 = require('md5');

exports.getAllowedUsers = function() {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query("SELECT doorAccessKey FROM doorAccess WHERE accessAllowed=1", function(err, result) {
			if(err) {
				reject(err);
			}

			console.log('access key result', result);
			var fileString = "";

			_.forEach(result, function(key) {
				console.log('key:', key);
				fileString += key.doorAccessKey;
				fileString += '\n';
			});

			console.log(fileString);

			fs.writeFile('public/fightme.txt', fileString, function(error) {
				if(error) {
					reject('write file error:', error);
				}

				console.log('i am here');

				fs.readFile('public/fightme.txt', function(err, buf) {
					if(err) {
						console.log(err);
					} else {
						console.log(buf);
						console.log(md5(buf));
						fs.writeFile('public/fightme.md5', md5(buf), function(error) {
							resolve();
						});
					}
				});
			});
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
