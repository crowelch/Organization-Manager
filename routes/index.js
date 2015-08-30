var express = require('express');
var Promise = require('es6-promise').Promise;
var router = express.Router();
var lookup = require('../utils/lookup').lookupByIso;
var lookupById = require('../utils/lookup').lookupByUcid
var db = require('../utils/sql');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Organization Manager' });
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
		email: person.email
	});

	}, function(error) {
		console.log('error:', error);
	});
});

module.exports = router;
