const child_process = require('child_process');

try {
	require.resolve('websocket');
} catch (e) {
	console.log('Installing dependencies...');
	child_process.execSync('npm install --production', {stdio: 'inherit'});
}

// Globals
global.Utils = require('./utils.js');
global.toId = Utils.toId;
global.Send = Utils.send;
global.Sendpm = Utils.sendpm;
global.FS = require('fs');
global.colors = require('colors');
global.logger = require('./logger.js');

// Config
try {
    global.Config = require('./config.js');
} catch (e) {
    global.Config = require('./config-example.js');
    logger.emit('error', 'Config.js doesn\'t exist. Cloning from config-example.js...')
    FS.copyFile('config-example.js', 'config.js', function() {});
}

// Event emitter
let events = require('events');
global.bot = new events.EventEmitter();

// Connect
let psurl = "ws://sim.smogon.com:8000/showdown/websocket";
let WebSocketClient = require('websocket').client;
let websocket = new WebSocketClient();
websocket.connect(psurl);

global.Connection = ""
websocket.on('connect', function (connection) {
	Connection = connection;
	connection.on('message', function (message) {
		let data = message.utf8Data;
        let parts = data.split('|');
        if (parts[1] !== 'init') console.log(data);
        bot.emit(parts[1], parts)
	});
});

bot.on('challstr', function(parts) {
    require("./login.js")(parts[2], parts[3])
});