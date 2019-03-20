const DELAY = 600;
let queue = [];
let sendNext = function () {
    if (queue.length === 0) return;
    let message = queue.splice(0, 1)
    Connection.send(message);
    setTimeout(sendNext, DELAY);
}

let sendTimeout = null;
let qSend = function (data) {
    if (Array.isArray(data)) {
        for (const toSend of data) qSend(toSend);
        return;
    }
    if (sendTimeout) {
        queue.push(data);
        return;
    }
    Connection.send(data);
    sendTimeout = setTimeout(() => {
        sendTimeout = null;
        const toSend = queue.shift();
        if (toSend) qSend(toSend);
    }, DELAY);
}

exports.send = function (room, message) {
    qSend(room + "|" + message);
};
	
exports.sendpm = function(user, message) {
    qSend("|/w " + user + ", " + message);
};

exports.toId = function(ting) {
	return ('' + ting).toLowerCase().replace(/[^a-z0-9]+/g, '');
};

exports.getRoom = function(room) {
	return room.replace(">", "").replace("\n", "")
};

global.Ranks = { 
	"~": 0,
	"&": 1,
	"#": 2,
	"*": 3,
	"@": 4,
	"%": 5,
	"+": 6,
	" ": 7,
    "!": 8,
};

exports.SplitMessage = function (message) {
    let a = message.startsWith(Config.char) ? message.split(" ")[0].substring(Config.char.length) : false;
    let b = message.substring(a.length + 2).replace(/, /g, ",").split(",");
    let c = message.substring(message.indexOf(",") + 1);
    if (c.startsWith(" ")) c = c.substring(1);
    return [a, b, c];
}