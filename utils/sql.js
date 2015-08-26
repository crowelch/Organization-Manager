var mysql = require('mysql');
var bcrypt = require('bcrypt');
var Promise = require('es6-promise').Promise;
var params = require('../config/secrets.js').params;


exports.putUser = function(userObject) {
	console.log(userObject);
	hashed(userObject.card).then(function(result) {
		delete userObject.card;
		userObject.cardHash = result;

		var connection = mysql.createConnection(params);
		connection.connect();
		connection.query("INSERT INTO members SET ?", userObject, function(err, result) {
			if(err) {
				console.log(err);
			}
			console.log('member ID:', result.insertId);
			console.log(result);
		});
		connection.end(function(err) {
			if(err) {
				console.log(err);
			}
		});

	}, function(err) {
		console.log(err);
	});
}

function hashed(iso) {
	return new Promise(function(resolve, reject) {
		bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash(iso, salt, function(err, hash) {
		        if(err) {
		        	reject(err);
		        }

		        console.log(hash);
		        resolve(hash);
		    });
		});
	});
}
