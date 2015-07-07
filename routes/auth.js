var User = require('../libs/mongoose').UserModel;
var Token = require('../libs/mongoose').TokenModel;
var log = require('../libs/log')(module);
//routes
module.exports = function (router, passport) {

	router.get('/', function (req, res) {
	    res.render('index.ejs', {user: "vlad"});
	});

	router.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

	/*******************/
	/* LOGIN ROUTES */
	/*******************/

	router.get('/local/signup', function (req, res) {
		res.render('signup.ejs', {message: req.flash('signupMessage') });
	});

	router.get('/local/login', function (req, res) {
		res.render('login.ejs', {message: req.flash('signinMessage')});
	});

	router.post('/local/login', passport.authenticate('local-login', {
		successRedirect: '/auth/profile',
		failureRedirect: '/auth/local/login',
		failureFlash: true
	}));

	router.get('/profile', isLoggedIn, function (req, res) {
		User.findOne({ _id: req.user._id }).populate('token').exec(function (err, user) {
			res.render('profile.ejs', { user : user });
		});
	});
	
	router.post('/local/signup', passport.authenticate('local-signup', {
		successRedirect: '/auth/local/login',
		failureRedirect: '/auth/local/signup',
		failureFlash: true
	}));

	router.get('/connect/local', function (req, res) {
		res.render('connect-local.ejs', {message: req.flash('signupMessage')});
	});

	router.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect: '/auth/profile',
		failureRedirect: '/auth/connect/local',
		failureFlash: true
	}));

	router.get('/unlink/local', function (req, res) {
		var user = req.user;
		user.local.username = null;
		user.local.password = null;
		user.save(function (err) {
			if(err)
				throw err;
			res.redirect('/profile');
		});
	});

	// GOOGLE //
	router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
	router.get('/google/callback',
		passport.authenticate('google', { successRedirect: '/auth/profile',
										  failureRedirect: '/'
	}));
	router.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email']}));
	
	router.get('/unlink/google', function (req, res) {
		var user = req.user;
		user.google.token = null;
		user.save(function (err) {
			if(err)
				throw err;
			res.redirect('/auth/profile');
		});
	});

	/****************/
	/* TOKEN ROUTES */
	/****************/

	router.get('/getToken', function  (req, res) {
		User.findOne({ _id: req.user._id}).populate('token').exec(function (err, user) {
			if(user.token == null)
				user.generateToken();
			req.user = user;
			res.redirect('/auth/profile');
		});
	});


	return router;
};

function isLoggedIn (req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

