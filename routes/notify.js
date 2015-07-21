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

	router.get('/setStatus/:status', function (req, res) {
		if(req.user){
			var access_token = req.user.vk.token;
			var profile_id = req.user.vk.id;
			var status = req.params.status;
			vkapi.request(
				config.get('vk:methods:set_status'),
				{
					group_id: profile_id,
					text: status
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


