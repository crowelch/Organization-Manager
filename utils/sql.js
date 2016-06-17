var bcrypt = require('bcrypt');
var moment = require('moment');
var _ = require('lodash');
var params = require('../config/secrets.js').params;
var utils = require('./utils');
var db = require('./db');

exports.createMember = function(userObject) {
	return new Promise(function(resolve) {
		resolve(db.insert('INSERT INTO members SET ?', userObject));
	});
};

exports.mNumberSignIn = function(providedMNumber) {
	return new Promise(function(resolve, reject) {
		var attendanceObject = {};

		utils.checkMeetingIsToday().then(function(meetingKey) {
			attendanceObject.meetingKey = meetingKey;
		}, function(error) {
			reject(error);
			throw new Error('No Meeting');
		}).then(function() {
			return utils.verifyMNumber(providedMNumber);
		}).then(function(verifiedMNumber) {
			console.log(verifiedMNumber);
			return utils.memberLookupByMNumber(verifiedMNumber);
		}).then(function(memberKey) {
			attendanceObject.memberKey = memberKey;

			db.insert('INSERT INTO attendance SET ?', attendanceObject)
				.then(function(queryResponse) {
					resolve('');
				}, function(error) {
					reject(error);
				});

		}, function(error) {
			reject(error);
		});
	});
};

exports.cardSignIn = function(card) {
	return new Promise(function(resolve, reject) {
		var meetingKey;
		var userKey;
		// Check that a meeting is happening today
		utils.checkMeeting().then(function(result) {
			if(result === []) {
				reject('No meeting today you scurvy curr!');
			}
			meetingKey = result;
		}, function(error) {
			reject(error);
		}).then(function() {
			utils.mNumberFinder(card).then(function(result){
				console.log('hi');
			}, function(error) {
				console.log(error);
			});
		}, function(error) {
			console.log('signInError: ' + error);
		});
	});
};

exports.createMeeting = function(date) {
	var insertDate = {
		date: date
	};

	return db.insert('INSERT INTO meetings SET ?', insertDate);
};

exports.getMembers = function() {
	return db.select('SELECT * FROM members');
};

exports.getMembersEmails = function() {
	return new Promise(function(resolve, reject) {
		db.select('SELECT email FROM members')
			.then(function(result) {
				resolve(emailsJSONToCSV(result));
			}, function(error) {
				reject(error);
			});
	});
};

exports.getMeetings = function() {
	return db.select('SELECT * FROM meetings');
};

function emailsJSONToCSV(emailsJSON) {
	var LAST_COMMA_POSITION = emailsJSON.length - 1;
	var emailsCSV = "";

	_.forEach(emailsJSON, function(value, position) {
		emailsCSV += value.email;

		if(position < LAST_COMMA_POSITION) {
			emailsCSV += ';';
		}
	});

	return emailsCSV;
}
