var mongoose = require('mongoose');
var log = require('./log')(module);
var config = require('./config');
var bcrypt = require('bcrypt-nodejs');
var randtoken = require('rand-token');

mongoose.connect("mongodb://" + config.get('mongoose:dbuser') + ":" + config.get('mongoose:dbpassword') + config.get('mongoose:hostx') + config.get('mongoose:dbname'));
//mongoose.connect(config.get('mongoose:uri'));
var db = mongoose.connection;

db.on('error', function (err) {
    log.error('connection error:', err.message);
});
db.once('open', function callback () {
    log.info("Connected to DB!");
});

var Schema = mongoose.Schema;

var User = new Schema({
	local: {
		username: String,
		password: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	token: {
		type: Schema.Types.ObjectId,
		ref: 'Token',
		default: null
	}
});

var tokenSchema = new Schema({
	value: String,
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	expireAt: {
		type: Date,
		expiries: 60 * 60 * 24 * 7,
		default: Date.now
	}
});

User.methods.generateToken = function  () {
	var token = new TokenModel();
	token.value = randtoken.generate(32);
	token.user = this._id;
	this.token = token._id;
	this.save(function (err) {
		if(err)
			throw err;
		token.save(function (err) {
			if(err)
				throw err;
		});
	})
}

User.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
};

User.methods.validatePassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

var UserModel = mongoose.model('User', User);
var TokenModel = mongoose.model('Token', tokenSchema);


var Item = new Schema({
	title: String,
	time: String,
	fontColor: String,
	bgColor: String
});

var Schedule = new Schema({
    title: String,
    schedule: [Item],
    isPrivate: {
    	type: Boolean,
    	required: true,
    	default: true
    },
    creator: String
});

var ScheduleModel = mongoose.model('Schedule', Schedule);

module.exports.ScheduleModel = ScheduleModel;
module.exports.UserModel = UserModel;
module.exports.TokenModel = TokenModel;
module.exports.connection = db;