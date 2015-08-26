var express = require('express');
var Promise = require('es6-promise').Promise;
var router = express.Router();
var db = require('../utils/sql');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/create-account', function(req, res, next) {
	res.render('create_account');
});

router.post('/create-account', function(req, res, next) {
	db.putUser(req.body).then(function(result) {
		res.render('account_created', {
		id: result
	});

	}, function(error) {
		console.log(error);
	});
});

router.post('/account-attendance', function(req, res, next) {
	res.render('account_attendance');
});

router.get('/attendance', function(req, res, next) {
	res.render('attendance');
});

router.post('/attendance', function(req, res, next) {
	console.log('card:', req.body.card);
	db.signIn(req.body.card);
	res.redirect('/post-attendance');
});


router.get('/post-attendance', function(req, res, next) {
	res.render('post-attendance', {
		cardExists: verifyCard(req.body.card)
	});
});

router.get('/meetings', function(req, res, next) {
	res.render('meetings');
});

router.get('meeting', function(req, res, next) {
	res.render('meeting');
});

router.get('/meeting-create', function(req, res, next) {
	res.render('meeting_create');
});

router.post('/meeting-create', function(req, res, next) {
	db.createMeeting(req.body.date);
	res.render('meeting_post_create');
});

router.get('/login', function(req, res, next) {
	res.render('login');
});

function verifyCard(card) {
	//if user exists, add to meeting
	// check to ensure only once per meeting per person
	// otherwise throw err
	return true;
}

function saveMeeting(meetingDate) {
	//create meeting in db
}

module.exports = router;
