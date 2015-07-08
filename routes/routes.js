var log = require('../libs/log')(module);
//routes
module.exports = function (router) {

	router.get('/', function (req, res) {
		if(req.user) res.redirect('/auth/profile');
	    res.render('index.ejs', {});
	});

	return router;
};

