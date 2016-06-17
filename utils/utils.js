var mysql = require('mysql');
var pasync = require('pasync');
var bcrypt = require('bcrypt');
var moment = require('moment');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var params = require('../config/secrets.js').params;
var db = require('./db');

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

exports.memberLookupByMNumber = function(mnumber) {
	var noAccountError = {
		meetingError: {
			noAccount: true
		}
	}

	return new Promise(function(resolve, reject) {
		db.select('SELECT * FROM members WHERE mNumber=' + mysql.escape(mnumber))
			.then(function(member) {
				if(member.length <= 0 || member === undefined) {
					reject(noAccountError);
				} else {
					resolve(member[0].membersKey);
				}
			}, function(error) {
				reject(error);
			});
	});
};

exports.checkMeetingIsToday = function() {
	var today = mysql.escape(moment().utcOffset(-4).format('YYYY-MM-DD'));
	var noMeetingError = {
		meetingError: {
			noMeeting: true
		}
	}

	return new Promise(function(resolve, reject) {
		db.select('SELECT * FROM meetings WHERE date=' + today)
			.then(function(meetingList) {
				if(meetingList.length <= 0
					|| meetingList[0].meetingKey === undefined) {
						reject(noMeetingError);
					} else {
						resolve(meetingList[0].meetingKey);
					}
			}, function(error) {
				reject(error);
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

exports.verifyMNumber = function(mNumber) {
	if(mNumber.charAt(0) === 'm') {
		mNumber = mNumber.replace('m', 'M');
	}

	if(mNumber.charAt(0).toUpperCase() !== 'M') {
		mNumber = 'M' + mNumber;
	}

	return Promise.resolve(mNumber);
}
