var winston = require('winston');
var paths = require('path');

function getLogger(module) {
    var path = module.filename.split('/').slice(-2).join('/'); 

    var logger = new (winston.Logger)({
        exitOnError: false,
        transports: [
            new (winston.transports.Console)({
                colorize:   true,
                level:      'silly',
                label:      path
            }), 
            new (winston.transports.File)({ 
                name: 'txt-log',
                filename: paths.join(__dirname, "../logs/debug.log"),
                json: false
            }), 
            new (winston.transports.File)({ 
                name: 'json-log',
                filename: paths.join(__dirname, "../logs/debug.json"),
                json: true
            }) 
        ]
    });

    return logger;
}

module.exports = getLogger;