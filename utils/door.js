var _ = require('lodash');
var sha1 = require('sha1');
var utils = require('./utils');
// var fs = require('fs');
var fs = require('./fs_promise');
var md5 = require('md5');
var db = require('./db');
var doorFilename = require('../config/secrets').doorFilename;

exports.getAllowedUsers = function() {
	var query = 'SELECT doorAccessKey FROM doorAccess WHERE accessAllowed=1';
	var filename = 'public/' + doorFilename;

	return db.select(query).then(function(result) {
		var fileString = '';

		_.forEach(result, function(key) {
			fileString += key.doorAccessKey;
			fileString += '\n';
		});

		console.log('filename', filename);
		console.log('doorfilename', doorFilename);

		return fileString;
	}, function (error) {
		console.log(error);
	}).then(function(data) {
		return fs.writeFile(filename + '.txt', data);
	}).then(function() {
		console.log('hiiii');
		return fs.readFile(filename + '.txt');
	}).then(function(buffer) {
		console.log('how');
		var md5Filename = filename + '.md5';
		console.log('buffer', buffer);
		return fs.writeFile(md5Filename, md5(buffer));
	});
};

exports.saveLog = function(log) {
	var query = 'INSERT INTO logs SET ?';
	return db.select(query, log);
};

exports.getLogs = function() {
	var query = 'SELECT * FROM logs';
	return db.select(query);
};

exports.registerDevice = function(userId, device) {
	var access = {
		doorAccessKey: device,
		memberKey: userId,
		accessAllowed: 1
	};

	var query = 'INSERT INTO doorAccess SET ?';
	return db.insert(query, access);
};

exports.getAllUsers = function() {
	var query = 'SELECT * FROM members';
	return db.select(query);
};
