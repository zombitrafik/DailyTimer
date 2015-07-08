var ScheduleModel = require('../libs/mongoose').ScheduleModel;
var log = require('../libs/log')(module);
//routes
module.exports = function (router, passport) {


	router.get('/info', function (req, res) {
		res.render('info.ejs', {});
	});

	router.use(passport.authenticate('bearer', { session: false }));

	router.use(function (req, res, next) {
		log.info(req.path + " access_token " + req.query.access_token);
		next();
	});
	/*******************/
	/* SHCEDULE ROUTES */
	/*******************/

	router.get('/schedules', function(req, res) {
		return ScheduleModel.find(function (err, schedules) {
			if (!err) {
				return res.json({ status: 'OK', schedules: schedules });
			} else {
				res.statusCode = 500;
				log.error('Internal error(%d): %s',res.statusCode,err.message);
				return res.json({ error: 'Server error' });
			}
		});
	});

	router.post('/schedules', function(req, res) {
		var schedule = new ScheduleModel({
			title: req.body.title,
			schedule: req.body.schedule
		});

		schedule.save(function (err) {
			if (!err) {
				log.info("schedule created");
				return res.json({ status: 'OK', schedule:schedule });
			} else {
				if(err.name == 'ValidationError') {
					res.statusCode = 400;
					res.json({ error: 'Validation error' });
				} else {
					res.statusCode = 500;
					res.json({ error: 'Server error' });
				}
				log.error('Internal error(%d): %s',res.statusCode,err.message);
			}
		});
	});

	router.get('/schedules/:id', function(req, res) {
		return ScheduleModel.findById(req.params.id, function (err, schedule) {
			if(!schedule) {
				res.statusCode = 404;
				return res.json({ error: 'Not found' });
			}
			if (!err) {
				return res.json({ status: 'OK', schedule:schedule });
			} else {
				res.statusCode = 500;
				log.error('Internal error(%d): %s',res.statusCode,err.message);
				return res.json({ error: 'Server error' });
			}
		});
	});

	router.put('/schedules/:id', function (req, res){
		return ScheduleModel.findById(req.params.id, function (err, schedule) {
			if(!schedule) {
				res.statusCode = 404;
				return res.json({ error: 'Not found' });
			}

			schedule.title = req.body.title;
			schedule.schedule = req.body.schedule;

			return schedule.save(function (err) {
				if (!err) {
					log.info("schedule updated");
					return res.json({ status: 'OK', schedule:schedule });
				} else {
					if(err.name == 'ValidationError') {
						res.statusCode = 400;
						res.json({ error: 'Validation error' });
					} else {
						res.statusCode = 500;
						res.json({ error: 'Server error' });
					}
					log.error('Internal error(%d): %s',res.statusCode,err.message);
				}
			});
		});    
	});

	router.delete('/schedules/:id', function (req, res){
		return ScheduleModel.findById(req.params.id, function (err, schedule) {
			if(!schedule) {
				res.statusCode = 404;
				return res.json({ error: 'Not found' });
			}
			return schedule.remove(function (err) {
				if (!err) {
					log.info("schedule removed");
					return res.json({ status: 'OK' });
				} else {
					res.statusCode = 500;
					log.error('Internal error(%d): %s',res.statusCode,err.message);
					return res.json({ error: 'Server error' });
				}
			});
		});
	});

	return router;
};


