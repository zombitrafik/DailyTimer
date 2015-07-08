var ScheduleModel = require('../libs/mongoose').ScheduleModel;
var TokenModel = require('../libs/mongoose').TokenModel;
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
		return TokenModel.findOne({ value: req.query.access_token }).populate('user').exec(function (err, token) {
			var user_id = token.user._id;
			return ScheduleModel.find({
				//$or: [ { creator: user_id }, { privates: user_id } ]
				creator: user_id
			},function (err, schedules) {
				if (!err) {
					return res.json({ status: 'OK', schedules: schedules });
				} else {
					res.statusCode = 500;
					log.error('Internal error(%d): %s',res.statusCode,err.message);
					return res.json({ error: 'Server error' });
				}
			});
		});
	});

	router.post('/schedules', function(req, res) {

		return TokenModel.findOne({value : req.query.access_token}).populate('user').exec(function (err, token) {
			var creator = token.user._id;

			var schedule = new ScheduleModel({
				title: req.body.title,
				schedule: req.body.schedule,
				isPrivate: req.body.isPrivate,
				creator: creator
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
	});

	router.get('/schedules/:id', function(req, res) {
		return ScheduleModel.findById(req.params.id, function (err, schedule) {

			if(!schedule) {
				res.statusCode = 404;
				return res.json({ error: 'Not found' });
			}
			if (!err) {
				//check for 'my' schedule
				return TokenModel.findOne({value : req.query.access_token}).populate('user').exec(function (err, token) {
					if(schedule.creator==token.user._id){
						return res.json({ status: 'OK', schedule:schedule });
					}else{
						return res.json({ status: 'erorr', message: 'You do not have access to this schedule!' });
					}
				});
				
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

			return TokenModel.findOne({value : req.query.access_token}).populate('user').exec(function (err, token) {
				if(schedule.creator==token.user._id){

					if(req.body.title)
						schedule.title = req.body.title;
					if(req.body.schedule)
						schedule.schedule = req.body.schedule;
					if(req.body.isPrivate)
						schedule.isPrivate = req.body.isPrivate;

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
					
				}else{
					return res.json({ status: 'erorr', message: 'You do not have access to edit this schedule!' });
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
			return TokenModel.findOne({value : req.query.access_token}).populate('user').exec(function (err, token) {
				if(schedule.creator==token.user._id){
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
				}else{
					return res.json({ status: 'erorr', message: 'You do not have access to remove this schedule!' });
				}
			});
			
		});
	});

	return router;
};


