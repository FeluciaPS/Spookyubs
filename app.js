'use strict';
const child_process = require('child_process');

try {
	require.resolve('websocket');
} catch (e) {
	console.log('Installing dependencies...');
	child_process.execSync('npm install --production', {stdio: 'inherit'});
}

// Event emitter
let events = require('events');
global.bot = new events.EventEmitter();

// Globals
global.Utils = require('./utils.js');
global.toId = Utils.toId;
global.Send = Utils.send;
global.Sendpm = Utils.sendpm;
global.FS = require('fs');
global.colors = require('colors');
global.logger = require('./logger.js');
global.parse = require('./parser.js');

// Config
try {
    global.Config = require('./config.js');
} catch (e) {
    global.Config = require('./config-example.js');
    logger.emit('error', 'Config.js doesn\'t exist. Cloning from config-example.js...')
    FS.copyFile('config-example.js', 'config.js', function() {});
}

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
        bot.emit(toId(parts[1]), parts);
	});
});

let files = {
    'logger': ['logger', 'logger.js'],
    'parser': ['Parse', 'parser.js'],
    'commands': ['Commands', 'commands.js'],
    'config': ['Config', 'config.js']
};

console.log("this works");
bot.on('reload', (file, room) => {
    logger.emit('cmd', 'reload', file);
    let all = file === "all";
    for (let f in files) {
        if (file !== f && !all) continue;
        let dt = files[f];
        eval("delete require.cache[require.resolve('./" + dt[1] + "')];");
        eval(dt[0] + " = require('./" + dt[1] + ");");
        Send(room, f + " reloaded.");
    }
});

bot.emit('reload');