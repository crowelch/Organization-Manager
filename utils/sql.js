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
			delete userObject.card;
			userObject.cardHash = result;

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

	//Check that a meeting is happening today
	// new Promise(function(resolve, reject) {
	// 	connection.query("SELECT * FROM meetings WHERE date=" + today, function(err, result) {
	// 		if(err) {
	// 			reject(err);
	// 		}
	// 		resolve(result);
	// 	});
	// }).then(function(result) {
	// 	if(result === []) {
	// 		reject('no meeting');
	// 	}
		// meetingKey = result.meetingKey;
		// console.log('meetingKey:', meetingKey);
		connection.query("SELECT * FROM members", function(err, result) {
			if(err) {
				console.log('err', err);
			}
			console.log('result', result);
			hashCompare(result, card);
			// resolve(result);
		});
	// }, function(error) {

	// }).then(function(result) {

	// }, function(error) {
	// 	console.log(error);
	// }).then(function() {
	// 	connection.end(function(err) {
	// 		if(err) {
	// 			console.log(err);
	// 		}
	// 	});
	// });
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
		bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash('B4c0/\/', salt, function(err, hash) {
				if(err) {
					reject(err)
				}

				resolve(hash);
			});
		});
		// bcrypt.genSalt(10, function(err, salt) {
		//     bcrypt.hash(data, salt, function(err, hash) {
		//         if(err) {
		//         	reject(err);
		//         }

		//         console.log(hash);
		//         resolve(hash);
		//     });
		// });
	});
}

function hashCompare(members, card) {
	console.log('yo');
	_.forEach(members, function(member) {
		bcrypt.compare(card, member.cardHash, function(err, same) {
			console.log(err, same);
		});
	});
	return new Promise(function(resolve, reject) {
		_.forEach(members, function(member) {
			console.log(member.membersKey);
			console.log(card, member.cardHash);
			if(bcrypt.compareSync(card, member.cardHash)) {
				console.log('success');
				resolve(member);
			} else {
				console.log('log');
			}
		});
		console.log('done;');
		reject('no match found');
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
