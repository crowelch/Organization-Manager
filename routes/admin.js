var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/login', function(req, res, next) {
	if (req.user) return res.redirect('/');
	res.render('admin/login', {
		title: 'Login'
	});
});

/**
 * POST /login
 * Sign in using email and password.
 */
 router.post('/login', function(req, res, next) {
 	req.assert('email', 'Email is not valid').isEmail();
 	req.assert('password', 'Password cannot be blank').notEmpty();

 	var errors = req.validationErrors();

 	if (errors) {
 		req.flash('errors', errors);
 		return res.redirect('/login');
 	}

 	passport.authenticate('local', function(err, user, info) {
 		if (err) return next(err);
 		if (!user) {
 			req.flash('errors', { msg: info.message });
 			return res.redirect('/login');
 		}
 		req.logIn(user, function(err) {
 			if (err) return next(err);
 			req.flash('success', { msg: 'Success! You are logged in.' });
 			res.redirect(req.session.returnTo || '/');
 		});
 	})(req, res, next);
 });

 router.get('logout', function(req, res, next) {
 	req.logout();
 	res.redirect('/');
 });

//disable this feature on production
router.get('create', function(req, res) {
	if (req.user) return res.redirect('/');
	res.render('admin/create', {
		title: 'Create Account'
	});
});

router.post('create', function(req, res, next) {
	req.assert('email', 'Email is not valid').isEmail();
	req.assert('password', 'Password must be at least 4 characters long').len(4);
	req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		req.flash('errors', errors);
		return res.redirect('/signup');
	}

	var user = new User({
		email: req.body.email,
		password: req.body.password
	});

	User.findOne({ email: req.body.email }, function(err, existingUser) {
		if (existingUser) {
			req.flash('errors', { msg: 'Account with that email address already exists.' });
			return res.redirect('/signup');
		}
		user.save(function(err) {
			if (err) return next(err);
			req.logIn(user, function(err) {
				if (err) return next(err);
				res.redirect('/');
			});
		});
	});
});

module.exports = router;
