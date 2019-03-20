bot.on('challstr', function(parts) {
    require("./login.js")(parts[2], parts[3])
});

bot.on('c', (parts) => {
    let room = Utils.getRoom(parts[0]);
    let user = Users[toId(parts[3])];
    logger.emit('chat', Utils.getRoom(parts[0]), parts[3], parts[4]);
    let message = parts[4].trim();
    let [cmd, args, val] = Utils.SplitMessage(message);
    if (cmd in Commands) {
        Commands[cmd](room, user, args, val);
        logger.emit('cmd', cmd, val);
    }
});

bot.on('j', (parts) => {
    let room = Utils.getRoom(parts[0]);
    let user = parts[2];
    if (!Users[toId(user)]) Users.add(user);
    Users[toId(user)].join(room, user);
});

bot.on('l', (parts) => {
    let room = Utils.getRoom(parts[0]);
    let user = toId(parts[2]);
    Users[user].leave(room);
});

bot.on('deinit', (parts) => {
    let room = Utils.getRoom(parts[0]);
    bot.emit('dereg', 'room', room);
});

bot.on('tournament', (parts) => {
    let room = Utils.getRoom(parts[0]);
    if (parts[2] === 'create' && Config.tours[room]) {
        Send(room, '/tour autostart ' + Config.tours[room][0]);
        Send(room, '/tour autodq ' + Config.tours[room][1]);
    } 
});

bot.on('dereg', (type, name) => {
    if (type === 'user') {
        delete Users[name];
    }
    else if (type === 'room') {
        delete Rooms[name];
    }
    else logger.emit('error', 'Invalid dereg type: ' + type);
});

bot.on('init', (parts, data) => {
    let room = Utils.getRoom(parts[0]);
    Rooms.add(room);
    parts = data.split("\n");
    for (let l in parts) {
        let line = parts[l];
        let part = line.split('|');
        if (part[1] === 'title') Rooms[room].name = part[2];
        if (part[1] === 'users') {
            let users = part[2].split(',')
            for (let i in users) {
                let user = users[i]
                if (i == 0) continue;
                if (!Users[toId(user)]) Users.add(user);
                Users[toId(user)].join(room, user);
            }
        }
    }
});

module.exports = {};