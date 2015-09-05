var mysql = require('mysql');
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

			_.forEach(result, function(member) {
				// console.log('caaaard',card, member.card);
				bcrypt.compare(card, member.card, function(err, same) {
					if(err) {
						console.log('compare err', err);
					} else if(same) {
						console.log('samesies');
						resolve(member.membersKey);
					}
				});
			});
			console.log('uh oh');
		});

		connection.end(function(err) {
			if(err) {
				console.log('hashcardcannotcloseerrror', err);
			}
		});
	});
}


exports.checkMeeting = function() {
	return new Promise(function(resolve, reject) {
		var today = mysql.escape(moment().utcOffset(-4).format('YYYY-MM-DD HH'));
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
}

exports.hashed = function(data) {
	return new Promise(function(resolve, reject) {
	    bcrypt.hash(data, 10, function(err, hash) {
			if(err) {
				reject(err);
			}

			console.log(hash);
			resolve(hash);
		});
	});
}
