var User = require('../libs/mongoose').UserModel;
var Token = require('../libs/mongoose').TokenModel;
var log = require('../libs/log')(module);
var request = require('request');

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

	// VK //

	router.get('/vk', passport.authenticate('vkontakte', { scope: ['friends', 'email'], display: 'page' }));
	router.get('/vk/callback', passport.authenticate('vkontakte', {
		successRedirect: '/auth/profile',
		failureRedirect: '/'
	}));
	router.get('/connect/vk', passport.authorize('vkontakte', { scope: ['friends', 'email'], display: 'page' }));
	router.get('/unlink/vk', function (req, res) {
		var user = req.user;
		user.vk.token = null;
		user.save(function (err) {
			if(err)
				throw err;
			res.redirect('/auth/profile');
		});
	});

	// GOOGLE //
	router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
	router.get('/google/callback',
		passport.authenticate('google', { 
			successRedirect: '/auth/profile',
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

	router.post('/google/getAccessById', function (req, res) {
		var id = req.body.id;
		var accessToken = req.body.accessToken;
		var displayName = req.body.displayName;
		var email = req.body.email;

		request.get({
			url: 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='+accessToken
		}, function (error, response, body) {
			body = JSON.parse(body);
			if(body.user_id==id){
				User.findOne({'google.id':id}, function (err, user) {
					if(err){
						res.statusCode = 500;
						res.json({message: 'Internal server error'});
					}
					if(!user){
						var newUser = new User();
						newUser.google.id = id;
						newUser.google.token = accessToken;
						newUser.google.name = displayName;
						newUser.google.email = email;
						newUser.generateToken();

						newUser.save(function(err){
							if(err)
								throw err;
							res.json({id: newUser._id});
						});
					}else{
						res.json({id: user._id});
					}
				});
			}else{
				res.json({message: 'Invalid access_token'});
				return;
			}
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

	router.post('/getTokenById', function (req, res) {
		var id = req.body.id;
		User.findOne({ _id : id}).populate('token').exec(function (err, user) {
			if(user === undefined){
				res.statusCode = 404;
				res.json({message: 'User not found'});
				return;
			}
			if(user.token == null)
				user.generateToken();
			res.json({token: user.token.value});
			
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

