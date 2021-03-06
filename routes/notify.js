var config = require('../libs/config');
var vkapi = require('../libs/vkapi');
//routes
module.exports = function (router) {


	router.get('/getUser', function (req, res) {
		if(req.user){
			var access_token = req.user.vk.token;
			vkapi.request(
				config.get('vk:methods:users_get'),
				{
					user_ids: '205387401, 1',
					fields: 'photo_50,city,verified'
				},
				access_token,
				//cb
				function (error, response, body) {
					if(error){
						res.json({error: error.message})
					}else{
						res.json(body);
					}
				}
			);
		}else{
			res.json({error: 'Unauthorized'});
		}
	});

	router.get('/postSchedule', function (req, res) {
		if(req.user){
			var access_token = req.user.vk.token;
			var profile_id = req.user.vk.id;
			vkapi.request(
				config.get('vk:methods:post_schedule'),
				{
					user_id: profile_id,
					schedule: "test message post",
					client_secret: config.get('vk:clientSecret')
				},
				access_token,
				//cb
				function (error, response, body) {
					if(error){
						res.json({error: error.message})
					}else{
						res.json(body);
					}
				}
			);
		}else{
			res.json({error: 'Unauthorized'});
		}
	});

	router.get('/sendMessage/:message', function (req, res) {
		if(req.user){
			var access_token = req.user.vk.token;
			var profile_id = req.user.vk.id;
			var message = req.params.message;
			vkapi.request(
				config.get('vk:methods:send_message'),
				{
					user_id: profile_id,
					message: message
				},
				access_token,
				//cb
				function (error, response, body) {
					if(error){
						res.json({error: error.message})
					}else{
						res.json(body);
					}
				}
			);
		}else{
			res.json({error: 'Unauthorized'});
		}
	});

	router.get('/setStatus/:text', function (req, res) {
		if(req.user){
			var access_token = req.user.vk.token;
			var profile_id = req.user.vk.id;
			var text = req.params.text;
			console.log('text ' + text);
			vkapi.request(
				config.get('vk:methods:set_status'),
				{
					group_id: profile_id,
					text: text
				},
				access_token,
				//cb
				function (error, response, body) {
					if(error){
						res.json({error: error.message})
					}else{
						res.json(body);
					}
				}
			);
		}else{
			res.json({error: 'Unauthorized'});
		}
	});


	return router;
};


