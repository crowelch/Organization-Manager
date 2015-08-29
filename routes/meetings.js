var express = require('express');
var router = express.Router();
var db = require('../utils/sql');

/* GET meetings middleware. */
router.use('/', function(req, res, next) {
	db.getMeetings().then(function(result) {
		req.meetings = result;
		next();
	}, function(error) {
		req.error = error;
		next();
	});
});

/* GET meetings. */
router.get('/', function(req, res, next) {
	if(req.error) {
		res.send(req.error);
	} else {
		// res.send(req.meetings);
		res.render('meetings', req.meetings);
	}
});

/* GET create meetings. */
router.get('/create', function(req, res, next) {
	res.render('meeting_create');
});

module.exports = router;
