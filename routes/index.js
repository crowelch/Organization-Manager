var express = require('express');
var Promise = require('es6-promise').Promise;
var router = express.Router();
var lookup = require('../utils/lookup').lookupByIso;
var lookupById = require('../utils/lookup').lookupByUcid;
var db = require('../utils/sql');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Organization Manager' });
});

router.get('/create-account', function(req, res, next) {
	res.render('create_account');
});

router.post('/create-account', function(req, res, next) {
	db.createMember(req.body).then(function(result) {
		res.render('signup-post');
	}, function(error) {
		console.log(error);
		res.render('signup-post', error);
	});
});

router.get('/attendance', function(req, res, next) {
	res.render('attendance');
});

router.post('/attendance', function(req, res, next) {
	console.log('card:', req.body.card);
	db.cardSignIn(req.body.card).then(function(result) {
		console.log(result);
		res.render('signin-post', {

		});
	}, function(error) {
		console.log(1, error);
		res.render('signin-post', error);
	});
});

router.get('/attendance-mnumber', function(req, res, next) {
	res.render('meetings/attendance_mnumber');
});

router.post('/attendance-mnumber', function(req, res, next) {
	console.log('m#:', req.body.mnumber);
	var mnumber = req.body.mnumber;
	if(mnumber.charAt(0) === 'm') {
		mnumber = mnumber.replace('m', 'M');
	}

	console.log('ggggg', mnumber.charAt(0).toUpperCase());

	if(mnumber.charAt(0).toUpperCase() !== 'M') {
		mnumber = 'M' + mnumber;
	}

	console.log('mnumber:', mnumber);
	db.betterSignIn(mnumber).then(function(result) {
		console.log(result);
		res.render('signin-post', {

		});
	}, function(error) {
		console.log(1, error);
		res.render('signin-post', error);
	});
});

router.get('/post-attendance', function(req, res, next) {
	res.render('post-attendance');
});


router.get('/login', function(req, res, next) {
	res.render('login');
});

router.get('/lookup', function(req, res, next) {
	res.render('lookup');
});

router.post('/lookup', function(req, res, next) {
	new Promise(function(resolve, reject) {
		lookup(req.body.card, function(error, result) {
			if(error) {
				reject(error);
			}
			resolve(result);
		});
	}).then(function(person) {
		res.render('create_account', {
		firstName: person.first_name,
		lastName: person.last_name,
		major: person.major,
		gradYear: person.graduation,
		email: person.email,
		card: req.body.card
	});

	}, function(error) {
		console.log('error:', error);
	});
});

module.exports = router;
