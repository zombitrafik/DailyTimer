var ScheduleModel = require('../libs/mongoose').ScheduleModel;
var TokenModel = require('../libs/mongoose').TokenModel;
var mongoose = require('mongoose');
var async = require('async');
var request = require('request');

var config = require('../libs/config');
var apiUrl = config.get('apiUrl');
var devApiUrl = config.get('devApiUrl');

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
				creator: creator,
				lastEditTime: Date.now()
			});

			console.log(schedule);

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

	router.post('/sync', function (req, res) {
		console.log(req.body);
		var access_token = req.query.access_token;
		var ids = [];
		var newSchedules = [];
		for(var i in req.body) {
			if(req.body[i]._id != ''){
				ids.push(mongoose.Types.ObjectId(req.body[i]._id));
			}else{
				console.log('new schedule');
				newSchedules.push(req.body[i]);
			}
		}
		var deleting = [];
		var updating = [];

		return ScheduleModel.find({_id: { $in : ids }}, function (err, schedules) {
			for(var i in schedules){
				for(var j in req.body){
					//equal schedule
					if(schedules[i]._id == req.body[j]._id){
						//removed by mobile client
						if(req.body[j].isDeleted){
							deleting.push(schedules[i]);
							break;
						}
						if(req.body[j].lastEditTime > schedules[i].lastEditTime){
							schedules[i].title = req.body[j].title;
							schedules[i].schedule = req.body[j].schedule;
							schedules[i].isPrivate = req.body[j].isPrivate;
							schedules[i].lastEditTime = req.body[j].lastEditTime;
							updating.push(schedules[i]);
						}
						break;
					}
				}
			}

			// deleting
			var removing = function(schedule, cb){
				request.del(apiUrl + '/schedules/' + schedule._id + '?access_token='+access_token, function(err,response,body){
					if ( err){
						cb(err);
					} else {
						cb(null, body);
					}
				});
			}

			// updating
			var update = function (schedule, cb) {
				request({ url: apiUrl + '/schedules/' + schedule._id + '?access_token='+access_token, method: 'PUT', json: schedule }, function (err, response, body) {
					if ( err){
						cb(err);
					} else {
						cb(null, body);
					}
				})
			}

			// newSchedules
			var createSchedules = function (schedule, cb) {
				request({ url: apiUrl + '/schedules?access_token='+access_token, method: 'POST', json: true, body: schedule }, function (err, response, body) {
					if ( err){
						cb(err);
					} else {
						cb(null, body);
					}
				})
			}

			var sync = [
				{items: deleting, method: removing},
				{items: updating, method: update},
				{items: newSchedules, method: createSchedules}
			]

			var parseSync = function (obj, cb) {
				async.map(obj.items, obj.method, function (err, response, body) {
					if(err){
						cb(err);
					}else{
						cb(null, body);
					}
				});
			}

			async.map(sync, parseSync, function (err, results) {
				if ( err){
					return res.json({erorr: err});
				} else {
					request.get(apiUrl + '/schedules?access_token='+access_token, function (err, response, body) {
						if(err){
							return res.json({erorr: err});
						}else{
							return res.json(JSON.parse(body));
						}
					});
				}
			})
			

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
					

					schedule.title = req.body.title;
					schedule.schedule = req.body.schedule;
					schedule.isPrivate = req.body.isPrivate;
					schedule.lastEditTime = req.body.lastEditTime;
					schedules.lastEditTime = Date.now();

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


