var express = require('express');
var passport = require('passport');
var cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var log = require('./libs/log')(module);
var path = require('path');
var methodOverride = require('method-override');
var mongoose = require('./libs/mongoose');
var MongoStore = require('connect-mongo')(session);
// configs 
var config = require('./libs/config');
require('./libs/passport')(passport);


var RoutesR = express.Router();
var Routes = require('./routes/routes')(RoutesR);
var AuthR = express.Router();
var Auth = require('./routes/auth')(AuthR, passport);
var SchedulesR = express.Router();
var Schedules = require('./routes/schedules')(SchedulesR, passport);
var ShareR = express.Router();
var Share = require('./routes/share')(ShareR);

var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(bodyParser.json())
app.use(methodOverride());
app.use(session({
    secret: "secretstring",
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection, ttl: 60 * 60 * 24 * 7 })
}));
app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || config.get('port'));
// routes
app.use(Routes);
app.use('/auth', Auth);
app.use('/api', Schedules);
app.use('/share', Share);

//Erorr hanlers
app.use(function(req, res, next){
    res.status(404);
    log.debug('Not found URL: %s',req.url);
    res.redirect('/schedules');
    //res.json({ error: 'Not found' });
    return;
});

app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('Internal error(%d): %s',res.statusCode,err.message);
    res.json({ error: err.message });
    return;
});

app.listen(app.get('port'), function(){
    log.info('Express server listening on port ' + app.get('port'));
});
