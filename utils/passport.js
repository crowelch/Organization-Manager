var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var sql = require('./db');
var bcrypt = require('bcrypt');
var _ = require('lodash');

passport.serializeUser(function(user, done) {
   done(null, user.userId);
});

passport.deserializeUser(function(id, done) {
   var query = 'SELECT * FROM user WHERE userId = ' + sql.escape(id);
   sql.select(query).then(function(result) {
      done(null, result[0]);
   });
});

passport.use('local-signup', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
   }, function(req, email, password, done) {
      // Reset Errors
      req.session.emailError = null;

      var query = 'SELECT * FROM user WHERE email = ' + sql.escape(email);
      sql.select(query).then(function(result) {
         if(result.length) { // Return if email is already in use
            req.session.emailError = 'That email is already in use.';
            return done(null, false);
         } else { // Insert new user
            var query = 'INSERT INTO user SET ?';
            var newUser = {
               email: email,
               password: bcrypt.hashSync(password, 10),
               firstName: req.body.firstname.charAt(0).toUpperCase()
                  + req.body.firstname.slice(1),
               lastName: req.body.lastname.charAt(0).toUpperCase()
                  + req.body.lastname.slice(1),
            };

            sql.insert(query, newUser).then(function(result) { // Add user to db
               newUser.userId = result.insertId;
               return done(null, newUser);
            });
         }
      }, function(error) {
         return done(error);
      });
}));

passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
   }, function(req, email, password, done) {
      var query = 'SELECT * FROM user WHERE email = ' + sql.escape(email);
      sql.select(query).then(function(result) {
         if(!result.length) {
            return done(null, false);
         }

         if(!bcrypt.compareSync(password, result[0].password)) {
            // Add error message if incorrect password
            req.session.passwordError = 'Incorrect password.';
            return done(null, false);
         } else {
            return done(null, result[0]);
         }

      }, function(error) {
         return done(error);
      });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];

  if(_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect('/login');
  }
};
