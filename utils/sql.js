var mysql = require('mysql');
var bcrypt = require('bcrypt');
var moment = require('moment');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var params = require('../config/secrets.js').params;
var utils = require('./utils');

// function connection(query, options) {
// 	console.log('in connection');
// 	function queryCallback(error, result) {
// 		if(error) {
// 			reject(error);
// 		}
// 		resolve(result);
// 		endConnection();
// 	}

// 	function endConnection() {
// 		connection.end(function(err) {
// 			if(err) {
// 				console.log(err);
// 			}
// 			console.log('in conn end of conn');
// 		});
// 	}

// 	var connection = mysql.createConnection(params);
// 	connection.connect();

// 	return new Promise(function(resolve, reject) {
// 		if(options) {
// 			connection.query(query, options, queryCallback);
// 		} else {
// 			connection.query(query, queryCallback);
// 		}
// 	});

// };

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

exports.betterSignIn = function(mnumber, card) {
	//todo add m to number if missing, uppercase if there
	return new Promise(function(resolve, reject) {
		var meetingKey;
		var userKey;
		utils.checkMeeting().then(function(result) {
			if(result === []) {
				reject('No meeting today you scurvy curr!');
			} else {
				meetingKey = result;
				return result;
			}
		}, function(error) {
			reject(error);
		}).then(function() {
			if(mnumber) {
				return utils.mNumberFinder(mnumber);
			} else if(card) {
				return utils.hashCompare(card);
			} else {
				reject('no card or mnumber provided');
			}
		}).then(function(userKey) {
			console.log('back from mNumberFinder:', userKey);
			if(meetingKey === undefined || userKey === undefined) {
				console.log('ohno');
				reject({
					meetingError: {
						databaseError: true
					}
				});
			} else {
				console.log('hi');
				dbEnterSignIn(meetingKey, userKey).then(function(queryResponse) {
					console.log('qr:', queryResponse);
					resolve('');
				}, function(error) {
					reject(error);
				});
			}
		}, function(error) {
			reject(error);
		});
	});
};

function dbEnterSignIn(meetingKey, userKey) {
	console.log('enter meeting attendance...');
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect(function(err) {
			console.log('no?', err);
		});
		connection.query("INSERT INTO attendance SET ?", {
			memberKey: userKey,
			meetingKey: meetingKey
		}, function(err, result) {
			if(err) {
				if(err.code === 'ER_DUP_ENTRY') {
					reject({
						meetingError: {
							alreadySignedIn: true
						}
					});
				}
				console.log('err in insertattnd', err);
			} else {
				console.log('attend?', result);
				resolve(result);
			}

			connection.end(function(err) {
				if(err) {
					console.log(err);
				}
			});
		});
	});
}

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

			utils.mNumberFinder(card).then(function(result){
				console.log('hi');
			}, function(error) {
				console.log(error);
			});

			// utils.hashCompare(card).then(function(result) {
			// 	var memberKey = result;
			// 	if(memberKey === undefined) {
			// 		reject('Member not found, have you created an account?');
			// 	} else {
			// 		console.log('memberKey', memberKey);

			// 		var connection = mysql.createConnection(params);
			// 		connection.connect();
			// 		connection.query("INSERT INTO attendance SET ?", {
			// 			memberKey: memberKey,
			// 			meetingKey: meetingKey
			// 		}, function(err, result) {
			// 			if(err) {
			// 				if(err.code ==='ER_DUP_ENTRY') {
			// 					reject({
			// 						meetingError: {
			// 							alreadySignedIn: true
			// 						}
			// 					});
			// 					return;
			// 				}
			// 				console.log('err in insertattnd', err);
			// 			} else {
			// 				resolve(result);
			// 				console.log('attend?', result);
			// 			}

			// 			connection.end(function(err) {
			// 				if(err) {
			// 					console.log(err);
			// 				}
			// 			});
			// 		});
			// 	}
			// }, function(error) {
			// 	reject({
			// 		meetingError: {
			// 			noAccount: true
			// 		}
			// 	});
			// 	console.log('eyyyy:', error);
			// });
		}, function(error) {
			console.log('y' + error);
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

exports.getMembersEmails = function() {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query("SELECT email FROM members", function(err, result) {
			if(err) {
				reject(err);
			}

			var emailsCSV = "";

			_.forEach(result, function(value, key) {
				emailsCSV += value.email;
				console.log(key);

				if(key < result.length - 2) {
					emailsCSV += ',';
				}
			});

			console.dir(emailsCSV);
			console.log(result.length);

			resolve(emailsCSV);
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
