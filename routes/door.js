var express = require('express');
var router = express.Router();
var db = require('../utils/door');

/* GET user ids for the door */
router.get('/users', function(req, res, next) {
	db.getAllowedUsers().then(function(result) {
		res.send(result);
	}, function(error) {
		res.send(error);
	});
});

/* POST door logs */
router.post('/log', function(req, res, next) {
	db.saveLog(req.body).then(function(result) {
		res.send(result);
	}, function(error) {
		res.send(error);
	})
});

/* POST register id */
router.post('/register', function(req, res, next) {
	console.dir(req.body);
	res.send('respond with a resource');
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
