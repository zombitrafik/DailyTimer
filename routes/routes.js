var log = require('../libs/log')(module);
var User = require('../libs/mongoose').UserModel;
var path = require('path');
//routes
module.exports = function (router) {

	router.get('/', function (req, res) {
		if(req.user) {
			res.redirect('/auth/profile');
	    } else{
	    	res.render('index.ejs', {});
		}
	});

	router.get('/schedules', function (req, res) {
		if(req.user) {
			User.findById(req.user._id).populate('token').exec(function (err, user) {
				if(user){
					res.render('schedules.ejs', {token: user.token});
				}else{
					res.redirect('/');
				}
			});
			
		}else{
			res.redirect('/');
		}
	});

	router.get('/dev-logs' ,function (req, res) {
		res.sendFile(path.join(__dirname, '../logs/debug.json'));
	});

	return router;
};

