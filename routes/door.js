var express = require('express');
var router = express.Router();
var db = require('../utils/door');

/* GET user ids for the door */
router.use('/users', function(req, res, next) {
	db.getAllowedUsers().then(function(result) {
		next();
	}, function(error) {
		res.send(error);
	});
});

/* GET user ids for the door */
router.get('/users', function(req, res, next) {
	var options = {
	    root: 'public/',
	};
	var fileName = 'fightme.txt';

	res.sendFile(fileName, options, function (err) {
	    if (err) {
	    	console.log(err);
	    	res.status(err.status).end();
	    }
	    else {
	    	console.log('Sent:', fileName);
	    }
	});
});

/* GET user ids for the door */
router.get('/users/md5', function(req, res, next) {
	var options = {
	    root: 'public/',
	};
	var fileName = 'fightme.md5';

	res.sendFile(fileName, options, function (err) {
	    if (err) {
	    	console.log(err);
	    	res.status(err.status).end();
	    }
	    else {
	    	console.log('Sent:', fileName);
	    	//delete file?
	    }
	});
});

/* GET set user ids for the door */
router.use('/users/add', function(req, res, next) {
	db.getAllUsers().then(function(result) {
		req.body.users = result;
		next();
	});
});

/* GET set user ids for the door */
router.get('/users/add', function(req, res, next) {
	res.render('door/add_user', {
			users: req.body.users
		});
});

/* POST set user ids for the door */
 router.post('/users/add', function(req, res, next) {
	console.log(req.body.sha, req.body.user);
	var shaValue = req.body.sha;
	var userId = req.body.user;
	db.registerDevice(userId, shaValue).then(function(result) {
		res.render('door/post_add_user');
	}, function(error) {
		res.send(error);
	});
});

/* POST door logs */
router.post('/log', function(req, res, next) {
	db.saveLog(req.body).then(function(result) {
		res.render('ok', result);
	}, function(error) {
		res.send('err', error);
	});
});

/* GET register id */
router.get('/register', function(req, res, next) {
	res.render('door/register');
});

/* POST register id */
router.post('/register', function(req, res, next) {
	res.send(req.body);
	db.registerDevice(req.body.card, req.body.device);
});

/* GET control member access */
router.get('/access', function(req, res, next) {
	console.dir(req.body);
	res.send('respond with a resource');
});

/* GET view door logs */
router.use('/logs', function(req, res, next) {
	db.getLogs().then(function(result) {
		req.logs = result;
		next();
	}, function(error) {
		req.error = error;
		next();
	});
});

router.get('/logs', function(req, res, next) {
	if(req.error) {
		res.send(error);
	}
	console.dir(req.logs);
	res.render('door/logs', req.logs);
});

module.exports = router;
