var ScheduleModel = require('../libs/mongoose').ScheduleModel;
var config = require('../libs/config');
var apiUrl = config.get('apiUrl'),
	devApiUrl = config.get('devApiUrl');

//routes
module.exports = function (router) {

	router.get('/:id', function(req, res) {
		var id = req.params.id;

		return ScheduleModel.findById(id, function (err, schedule) {
			if(err) {
				res.statusCode = 500
				return res.json({status: 'ERROR', message: err.message });		
			}
			if(!schedule) {
				res.statusCode = 404;
				return res.json({status: 'ERROR', message: 'Schedule not found!'});
			}
			if(schedule.isPrivate){
				res.statusCode = 400;
				return res.json({status: 'ERROR', message: 'You do not have access to this schedule!'})
			}
			var result = {
				_id: '',
				isPrivate: schedule.isPrivate,
				title: schedule.title,
				schedule: [],
				accessCb: devApiUrl.replace('/api', '') +'/share/access/' + schedule._id
			};
			var items = schedule.getItems();
			for(var i = 0; i < items.length; i++){
				result.schedule.push({
					title: items[i].title,
					fontColor: items[i].fontColor,
					bgColor: items[i].bgColor,
					time: items[i].time
				});
			}
			return res.render('share.ejs', {schedule: result});
		});

	});

	router.get('/access/:id', function (req, res) {

		var id = req.params.id;

		if(req.user){
			return ScheduleModel.findById(id, function (err, schedule) {
				if(err) {
					res.statusCode = 500
					return res.json({status: 'ERROR', message: err.message });		
				}
				if(!schedule) {
					res.statusCode = 404;
					return res.json({status: 'ERROR', message: 'Schedule not found!'});
				}
				if(schedule.isPrivate){
					res.statusCode = 400;
					return res.json({status: 'ERROR', message: 'You do not have access to this schedule!'})
				}

				var items = schedule.getItems();
				var copiedItems = [];
				for(var i = 0; i < items.length; i++){
					copiedItems.push({
						title: items[i].title,
						fontColor: items[i].fontColor,
						bgColor: items[i].bgColor,
						time: items[i].time
					});
				}

				var newSchedule = new ScheduleModel({
					isPrivate: schedule.isPrivate,
					title: schedule.title,
					lastEditTime: Date.now(),
					creator: req.user._id,
					schedule: copiedItems
				});

				return newSchedule.save(function (err) {
					if(err){
						res.statusCode = 500;
						return res.json({status: 'ERROR', message: err.message});
					}else{
						return res.redirect('/schedules');
					}
				});
							
			});
			
		}else{
			return res.redirect('/');
		}

	});

	return router;
};


