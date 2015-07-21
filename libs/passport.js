var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var VKontakteStrategy = require('passport-vkontakte').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var log = require('./log')(module);
var User = require('../libs/mongoose').UserModel;
var Token = require('../libs/mongoose').TokenModel;
var config = require('./config');

module.exports = function (passport) {
	
	passport.serializeUser(function (user, done) {
		done(null, user);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(null, user);
		});
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function (req, username, password, done) {
		process.nextTick(function () {
			User.findOne({'local.username' : username}, function (err, user) {
				if(err)
					return done(err);
				if(user) {
					return done(null, false, req.flash('signupMessage', 'This nickname already taken!'));
				}
				if(!req.user){
					var newUser = new User();
					newUser.local.username = username;
					newUser.local.password = newUser.generateHash(password);

					newUser.save(function (err) {
						if(err)
							throw err;
						return done(null, newUser);
					});
				}else{
					var user = req.user;
					user.local.username = username;
					user.local.password = user.generateHash(password);

					user.save(function (err) {
						if(err)
							return err;
						return done(null, user);
					});
				}
				
			});
		});
	}
	));

	passport.use('local-login', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function (req, username, password, done) {
		process.nextTick(function () {
			User.findOne({'local.username':username}, function (err, user) {
				console.log(user);
				if(err) 
					return done(err);
				if(!user)
					return done(null, false, req.flash('signinMessage', 'Ivalid username or password!'));
				if(!user.validatePassword(password)){
					return done(null, false, req.flash('signinMessage', 'Ivalid username or password!'));
				}
				return done(null, user);
			})
		});
	}
	));

	passport.use(new GoogleStrategy({
	    clientID: config.get('google:clientID'),
	    clientSecret: config.get('google:clientSecret'),
	    callbackURL: config.get('google:callbackURL'),
	    passReqToCallback: true
	  },
	  function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
		    	if(!req.user){
					User.findOne({'google.id': profile.id}, function(err, user){
		    			if(err)
		    				return done(err);
		    			if(user) {
		    				if(!user.token){
		    					user.google.token = accessToken;
		    					user.google.name = profile.displayName;
		    					user.google.email = profile.emails[0].value;
		    					user.save(function (err) {
		    						if(err)
		    							throw err;
		    					});
		    				}
		    				return done(null, user);
		    			}
		    			else {
		    				var newUser = new User();
		    				newUser.google.id = profile.id.toString();
		    				newUser.google.token = accessToken;
		    				newUser.google.name = profile.displayName;
		    				newUser.google.email = profile.emails[0].value;

		    				newUser.save(function(err){
		    					if(err)
		    						throw err;
		    					return done(null, newUser);
		    				})
		    			}
		    		});	
		    	}else{
					var user = req.user;
					user.google.id = profile.id.toString();
		  			user.google.token = accessToken;
		  			user.google.name = profile.displayName;
		  			user.google.email = profile.emails[0].value;

		  			user.save(function  (err) {
		  				if(err)
		  					throw err;
		  				return done(null, user);
		  			});
				}
	    	});
	    }

	));

	passport.use(new VKontakteStrategy({
			clientID: config.get('vk:clientID'),
	    	clientSecret: config.get('vk:clientSecret'),
	    	callbackURL: config.get('vk:callbackURL'),
	    	passReqToCallback: true
		},
		function(req, accessToken, refreshToken, profile, done) {
			console.log('profile');
			console.log(profile);
	    	process.nextTick(function(){
		    	if(!req.user){
					User.findOne({'vk.id': profile.id}, function(err, user){
		    			if(err)
		    				return done(err);
		    			if(user) {
		    				if(!user.token){
		    					user.vk.token = accessToken;
		    					user.vk.name = profile.displayName || 'none';
		    					user.vk.email = /* profile.emails[0].value || */ 'none';
		    					user.save(function (err) {
		    						if(err)
		    							throw err;
		    					});
		    				}
		    				return done(null, user);
		    			}
		    			else {
		    				var newUser = new User();
		    				newUser.vk.id = profile.id.toString();
		    				newUser.vk.token = accessToken;
		    				newUser.vk.name = profile.displayName || 'none';
		    				newUser.vk.email = /* profile.emails[0].value || */ 'none';

		    				newUser.save(function(err){
		    					if(err)
		    						throw err;
		    					return done(null, newUser);
		    				})
		    			}
		    		});	
		    	}else{
					var user = req.user;
					user.vk.id = profile.id.toString();
		  			user.vk.token = accessToken;
		  			user.vk.name = profile.displayName || 'none';
		  			user.vk.email = /* profile.emails[0].value || */ 'none';

		  			user.save(function  (err) {
		  				if(err)
		  					throw err;
		  				return done(null, user);
		  			});
				}
	    	});
	    }
	));

	passport.use(new BearerStrategy({}, 
		function (token, done) {
			/*
			User.findOne({_id: token}, function (err, user) {
				if(!user){
					return done(null, false);
				}
				return done(null, user);
			});
			*/
			Token.findOne({ value : token }).populate('user').exec( function  (err, token) {
				if(!token)
					return done(null, false);
				return done(null, token.user);
			});
		}));

}