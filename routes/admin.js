var express = require('express');
var router = express.Router();
var passport = require('passport');
var passportConfig = require('../utils/passport');

router.get('/', function(req, res) {
	res.redirect('/admin/login');
});

/* GET admin login. */
router.get('/login', function(req, res) {
	if (req.user) {
		return res.redirect('/');
	} else {
		res.render('admin/login', {
			title: 'Login'
		});
	}
});

/* POST login page. */
router.post('/login',
   passport.authenticate('local-login', {
      successRedirect:'/welcome',
      failureRedirect: '/login',
      failureFlash: true
   }), function(req, res) {
      if(req.body.remember) {
         req.session.cookie.maxAge = 1000 * 60 * 3;
      } else {
         req.session.cookie.expires = false;
      }

      res.redirect('/welcome');
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

// Protect this feature on production
router.get('/create', function(req, res) {
	if(req.user) {
		return res.redirect('/');
	} else {
		res.render('admin/create_account', {
			title: 'Create Account'
		});
	}
});

/* POST signup page. */
router.post('/create', passport.authenticate('local-signup', {
   successRedirect: '/verification',
   failureRedirect: '/create',
   failureFlash: true
}));

module.exports = router;
