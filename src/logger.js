
const fs = require('fs');
const __ = require('iterate-js');
const moment = require('moment');

const logger = {
    log: (msg) => { 
        logger.write('LOG', msg);
        console.log(msg);
    },
    error: (msg) => {
        logger.write('ERROR', msg);
        console.error(msg);
    },
    write: (type, msg) => {
        fs.appendFile('rhythm-bot-log.log', `(${moment().format()}) [${type.toUpperCase()}]: ${msg}\r\n`, function(err) {
            if(err) throw err;
        });
    }
};

module.exports = logger;
