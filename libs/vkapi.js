// https://api.vk.com/method/'''METHOD_NAME'''?'''PARAMETERS'''&access_token='''ACCESS_TOKEN'''
var request = require('request');
var config = require('./config');

var VK = function () {
	console.log('init');
	this.apiUrl = config.get('vk:apiUrl');
};

VK.prototype.request = function(method, params, access_token, cb) {
	var prms = '';
	for(var i in params){
		prms += i + '=' + params[i] + '&';
	}
	var url = this.apiUrl + method + prms + 'access_token=' + access_token;
	console.log(url);
	request.get(url, cb);
};


module.exports = new VK();