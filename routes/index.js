var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/create-account', function(req, res, next) {
	res.render('create_account');
});

router.post('/create-account', function(req, res, next) {
	console.dir(req.body);
	res.render('account_created');
});

router.get('/attendance', function(req, res, next) {
	if(req.body.login) {
		req.flash('success', {
			msg: 'Good job!'
		});
		req.body.login = false;
	} else {
		res.render('attendance');
	}
});

router.post('/attendance', function(req, res, next) {
	console.log(req.body.card);

});

router.get('/login', function(req, res, next) {
	res.render('login');
});

function verifyCard(card) {
	//if card in db, sign in
	//otherwise throw err
}

module.exports = router;
