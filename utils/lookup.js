var request = require('request');
var zlib = require('zlibjs');
var utils = require('./utils');

var lookup = function(type, id, callback) {
	var req = request.post('http://tribunal.uc.edu/attendance/ajax/lookup', {
		form: {
			type: type,
			id: id
		},
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			'Accept-Encoding': 'gzip'
		},
		encoding: null
	});

	return req.on('response', function(res) {
		var chunks;
		chunks = [];

		res.on('data', function(chunk) {
			return chunks.push(chunk);
		});

		return res.on('end', function() {
			var buffer = Buffer.concat(chunks);
			return zlib.gunzip(buffer, function(err, decoded) {
				var data;
				data = JSON.parse(decoded.toString());
				err = err || data.err;

				callback(err, data);
			});
		});
	});
};

exports.lookupByIso = function(iso, callback) {
	var cleanedIso = iso.split('=')[0].substr(3);
	console.log(cleanedIso);
	return lookup('iso', cleanedIso, callback);
};

exports.lookupByUcid = function(ucid) {
	return new Promise(function(resolve) {
		utils.verifyMNumber(ucid).then(function(verifiedUcid) {
			lookup('ucid', verifiedUcid, function(err, data) {
				resolve(data);
			});
		});
	});
};
