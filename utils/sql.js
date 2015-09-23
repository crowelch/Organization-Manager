var mysql = require('mysql');
var bcrypt = require('bcrypt');
var moment = require('moment');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var params = require('../config/secrets.js').params;
var utils = require('./utils');

exports.putUser = function(userObject) {
	console.dir(userObject);
	return new Promise(function(resolve, reject) {
		utils.hashed(userObject.card).then(function(result) {
			userObject.card = result;

			var connection = mysql.createConnection(params);
			connection.connect();
			connection.query("INSERT INTO members SET ?", userObject, function(err, result) {
				if(err) {
					console.log('sql insert err', err.code);
					if(err.code === 'ER_DUP_ENTRY') {
						console.log('here');
						reject({
							accountexists: true
						});
					} else {
						reject(err);
					}
				} else {
					console.log('member ID:', result.insertId);
					console.log(result);
					resolve(result.insertId);
				}
			});
			connection.end(function(err) {
				if(err) {
					console.log(err);
				}
			});
		}, function(err) {
			reject(err);
		});
	});
};

exports.signIn = function(card) {
	return new Promise(function(resolve, reject) {
		var meetingKey;
		var userKey;
		// Check that a meeting is happening today
		utils.checkMeeting().then(function(result) {
			console.log('after checkmeeting');
			if(result === []) {
				reject('No meeting today you scurvy curr!');
			}
			meetingKey = result;
		}, function(error) {
			reject(error);
		}).then(function() {
			console.log('about to check member');
			utils.hashCompare(card).then(function(result) {
				var memberKey = result;
				if(memberKey === undefined) {
					reject('Member not found, have you created an account?');
				} else {
					console.log('memberKey', memberKey);

					var connection = mysql.createConnection(params);
					connection.connect();
					connection.query("INSERT INTO attendance SET ?", {
						memberKey: memberKey,
						meetingKey: meetingKey
					}, function(err, result) {
						if(err) {
							if(err.code ==='ER_DUP_ENTRY') {
								reject({
									meetingError: {
										alreadySignedIn: true
									}
								});
								return;
							}
							console.log('err in insertattnd', err);
						} else {
							resolve(result);
							console.log('attend?', result);
						}

						connection.end(function(err) {
							if(err) {
								console.log(err);
							}
						});
					});
				}
			}, function(error) {
				reject({
					meetingError: {
						noAccount: true
					}
				});
				console.log('eyyyy:', error);
			});
		}, function(error) {
			console.log(error);
		});
	});
};

exports.createMeeting = function(date) {
	console.log(date);
	var insertDate = {
		date: date
	};

	var connection = mysql.createConnection(params);
	connection.connect();
	connection.query("INSERT INTO meetings SET ?", insertDate, function(err, result) {
		if(err) {
			console.log(err);
		}
		console.log('meeting ID:', result.insertId);
		console.log(result);
	});
	connection.end(function(err) {
		if(err) {
			console.log(err);
		}
	});
};

exports.getMembers = function() {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query("SELECT * FROM members", function(err, result) {
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

exports.getMeetings = function() {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query("SELECT * FROM meetings", function(err, result) {
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
