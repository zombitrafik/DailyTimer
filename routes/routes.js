var log = require('../libs/log')(module);
//routes
module.exports = function (router) {

	router.get('/', function (req, res) {
	    res.render('index.ejs', {});
	});

	return router;
};

