bot.on('challstr', function(parts) {
    require("./login.js")(parts[2], parts[3])
});

bot.on('c', (parts) => {
    let room = Utils.getRoom(parts[0]);
    let user = Users[toId(parts[3])];
    let message = parts[4].trim();
    logger.emit('chat', Utils.getRoom(parts[0]), user.name, message);
    let time = parts[2];
    let [cmd, args, val] = Utils.SplitMessage(message);
    if (cmd in Commands) {
        if (typeof Commands[cmd] === 'string') cmd = Commands[cmd];
        Commands[cmd](Rooms[room], user, args, val, time);
        logger.emit('cmd', cmd, val);
    }
});

bot.on('pm', (parts) => {
    let room = null;
    let user = Users[toId(parts[2])];
    let message = parts[4].trim();
    logger.emit('pm', user.name, message); // Note: No PM handler exists for the logger.
    let [cmd, args, val] = Utils.SplitMessage(message);
    if (cmd in Commands) {
        if (typeof Commands[cmd] === 'string') cmd = Commands[cmd];
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
    // This crashes sometimes and I don't yet know why, so we're using crash mail until I figure it out.
    try {
        Users[user].leave(room);
    }
    catch (e) {
        for (let dev in Config.devs) Parse.cmd(null, Users[toId(Config.username)], `.mail ${Config.devs[dev]}, ${user} can't leave ${room}`)
        logger.emit('error', `${user} can't leave ${room}`);
    }
});

bot.on('n', (parts) => {
    let room = Utils.getRoom(parts[0]);
    let oldname = parts[3];
    let newname = parts[2];
    Rooms[room].rename(oldname, newname);
});

bot.on('deinit', (parts) => {
    let room = Utils.getRoom(parts[0]);
    Rooms[room].leave();
});

bot.on('tournament', (parts) => {
    let room = Rooms[Utils.getRoom(parts[0])];
    let type = parts[2];
    if (type === "create") if (!room.tournament) room.startTour(false);
    if (type === "end" || type === "forceend") room.endTour();
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
        if (part[1] === 'tournament') {
            if (part[2] === "end" || part[1] === "forceend") {
                Rooms[room].endTour();
            }
            else { 
                if (!Rooms[room].tournament) Rooms[room].startTour("late");
            }
        }
    }
});

module.exports = {
    cmd: function(room, user, message) {
        let [cmd, args, val] = Utils.SplitMessage(message);
        if (cmd in Commands) {
            if (typeof Commands[cmd] === 'string') cmd = Commands[cmd];
            Commands[cmd](Rooms[room], user, args, val);
            logger.emit('fakecmd', cmd, val);
        }
    }
};