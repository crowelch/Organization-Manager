var mysql = require('mysql');
var bcrypt = require('bcrypt');
var moment = require('moment');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var params = require('../config/secrets.js').params;


exports.putUser = function(userObject) {
	return new Promise(function(resolve, reject) {
		console.log(userObject);
		hashed(userObject.card).then(function(result) {
			userObject.card = result;

			var connection = mysql.createConnection(params);
			connection.connect();
			connection.query("INSERT INTO members SET ?", userObject, function(err, result) {
				if(err) {
					reject(err);
				}
				console.log('member ID:', result.insertId);
				console.log(result);
				resolve(result.insertId);
			});
			connection.end(function(err) {
				if(err) {
					reject(err);
				}
			});

		}, function(err) {
			reject(err);
		});
	});
}

exports.signIn = function(card) {
	//else insert meeting key and userId into attendance table
	//display success

	var meetingKey;
	var userKey;
	var today = mysql.escape(moment().format('YYYY-MM-DD'));
	console.log(typeof today);

	var connection = mysql.createConnection(params);
	connection.connect();

	// Check that a meeting is happening today
	new Promise(function(resolve, reject) {
		connection.query("SELECT * FROM meetings WHERE date=" + today, function(err, result) {
			if(err) {
				reject(err);
			}
			console.log('meeting?', result);
			resolve(result[0].meetingKey);
		});
	// Assign meetingKey
	}).then(function(result) {
		if(result === []) {
			console.log('no meeting');
		}

		meetingKey = result
		console.log('meetingKey:', meetingKey);
	}, function(error) {
		console.log(error);
	// Find user
	}).then(function(result) {
		connection.query("SELECT * FROM members", function(err, result) {
			if(err) {
				console.log('err', err);
			}

			hashCompare(result, card).then(function(result) {
				var membersKey = result;
				console.log('membersKey', membersKey);
				connection.query("INSERT INTO attendance SET ?", {
					memberKey: membersKey,
					meetingKey: meetingKey
				}, function(err, result) {
					console.log('err in insertattnd', err);
					console.log('attend?', result);

					connection.end(function(err) {
						if(err) {
							console.log(err);
						}
					});
				});
			}, function(error) {
				console.log(error);
			});
		});
	}, function(error) {
		console.log(error);
	});
}

exports.createMeeting = function(date) {
	console.log(date);
	var insertDate = {
		date: date
	}

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
}

function hashed(data) {
	return new Promise(function(resolve, reject) {
	    bcrypt.hash(data, 10, function(err, hash) {
			if(err) {
				reject(err)
			}

			console.log(hash);

			console.log(bcrypt.compare(data, hash, function(err, same) {
				if(err) {
					console.log('initcompareerr', err);
				}
				console.log(same);
			}))

			resolve(hash);
		});
	});
}

function hashCompare(members, card) {
	return new Promise(function(resolve, reject) {
		_.forEach(members, function(member) {
			console.log(card, member.card);
			bcrypt.compare(card, member.card, function(err, same) {
				if(err) {
					console.log('compare err', err);
				} else if(same) {
					resolve(member.membersKey)
				}
			});
		});
		// reject('card not found');
	});
}

function dateCheck(date) {
	var today = moment();
	var meeting = moment(date);

	return new Promise(function(resolve, reject) {
		if(today.year() === meeting.year()
			&& today.month() == meeting.month()
			&& today.date() === meeting.date()) {
			resolve();
		} else {
			reject('No meeting today you scurvy curr!');
		}
	});
}
