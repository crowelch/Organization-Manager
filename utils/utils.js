var mysql = require('mysql');
var pasync = require('pasync');
var bcrypt = require('bcrypt');
var moment = require('moment');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var params = require('../config/secrets.js').params;

exports.hashCompare = function(card) {
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();
		connection.query("SELECT * FROM members", function(err, result) {
			if(err) {
				console.log('err', err);
			}

			var membersKey = false;
			pasync.each(result, function(member) {
				if(bcrypt.compareSync(card, member.card)) {
					membersKey = member.membersKey;
				}
			}).then(function() {
				console.log('post hoc', membersKey);
				if(membersKey) {
					resolve(membersKey);
				} else {
					reject('no member found');
				}
			}, function(error) {
				console.log(error);
			}).catch(function(error) {
				console.log('2', error);
			});
		});

		connection.end(function(err) {
			if(err) {
				console.log('hashcardcannotcloseerrror', err);
			}
		});
	});
};

exports.mNumberFinder = function(mnumber) {
	console.log('in m#finder', mnumber);
	return new Promise(function(resolve, reject) {
		var connection = mysql.createConnection(params);
		connection.connect();
		connection.query("SELECT * FROM members WHERE mNumber=" + mysql.escape(mnumber), function(err, result) {
			if(err) {
				console.log('err', err);
				reject({
					meetingError: {
						databaseError: true
					}
				});
			}

			console.log('member found! - ', result);
			if(result.length <= 0) {
				console.log('koi');
				reject({
					meetingError: {
						noAccount: true
					}
  				});
			} else {
				resolve(result[0].membersKey);
			}
		});

		connection.end(function(err) {
			if(err) {
				console.log('mnumberfindercannotcloseerrror', err);
			}
		});
	});
};

exports.checkMeeting = function() {
	console.log('in checkMeeting');
	return new Promise(function(resolve, reject) {
		var today = mysql.escape(moment().utcOffset(-4).format('YYYY-MM-DD'));
		console.log('today:', today);
		var connection = mysql.createConnection(params);
		connection.connect();

		connection.query("SELECT * FROM meetings WHERE date=" + today, function(err, result) {
			if(err) {
				reject(err);
			} else {
				console.log('meeting?', result);
				if(result.length <= 0) {
					reject({
						meetingError: {
							noMeeting: true
						}
					});
				} else {
					resolve(result[0].meetingKey);
				}
			}
		});

		connection.end(function(err) {
			if(err) {
				console.log('mtgcannotcloseerrror', err);
			}
		});
	});
};

exports.hashCard = function(data) {
	return new Promise(function(resolve, reject) {
	    bcrypt.hash(data, 10, function(err, hash) {
			if(err) {
				reject(err);
			} else {
				resolve(hash);
			}
		});
	});
};
