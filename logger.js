let colors = require('colors');
let events = require('events');
module.exports = logger = new events.EventEmitter();

logger.on('error', function(msg) {
    console.log(`[${"ERROR".red}] ${msg}`);
});

logger.on('cmd', (cmd, args) => {
    console.log(`[${cmd.green}] ${args}`);
});