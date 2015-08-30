var express = require('express');
var router = express.Router();
var db = require('../utils/sql');

/* GET users listing. */
router.use('/view', function(req, res, next) {
	db.getMembers().then(function(result) {
		req.members = result;
		next();
	}, function(error) {
		req.error = error;
		next();
	});
});

/* GET users listing. */
router.get('/view', function(req, res, next) {
	console.dir(req.members[1]);
	if(req.error) {
		res.send(req.error);
	}
	res.render('members/view', req.members);
});

router.get('/create', function(req, res, next) {
	res.render('create_account');
});

router.post('/create', function(req, res, next) {
	db.putUser(req.body).then(function(result) {
		res.render('account_created', {
			id: result
		});
	}, function(error) {
		res.send(error);
	});
});


module.exports = router;
