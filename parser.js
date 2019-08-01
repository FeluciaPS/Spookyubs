let purge = function() {
    for (let i in Users) {
        if (Users[i] === Users.self) continue;
        if (i === "add") continue;
        try {
            if (!Users[i].last) continue;
        }
        catch (e) {
            console.log(Users[i]);
            console.log(i);
            throw e;
        }
        let now = Date.now();
        if (now - Users[i].last >= 1000*60*60*2) delete Users[i];
    }
    setTimeout(purge, 1000 * 60 * 15);
}
setTimeout(purge, 1000 * 60 * 3);

bot.on('challstr', function(parts) {
    require("./login.js")(parts[2], parts[3])
});

bot.on('updateuser', (parts) => {
    logger.emit('log', 'Logged in as ' + parts[2]);
});

bot.on('c', (parts) => {
    let room = Utils.getRoom(parts[0]);
    let user = Users[toId(parts[3])];
    if (!parts[4]) return;
    let message = parts.splice(4, parts.length - 4).join("|").trim();
    logger.emit('chat', Utils.getRoom(parts[0]), user.name, message);
    let time = parts[2];
    let [cmd, args, val] = Utils.SplitMessage(message);
    if (cmd in Commands) {
        if (typeof Commands[cmd] === 'string') cmd = Commands[cmd];
        let func = Commands[cmd];
        if (typeof func === 'object') {
            if (!args[0] || !func[toId(args[0])]) func = func[''];
            else func = func[toId(args[0])];
            args.shift();
        }
        try {
            func(Rooms[room], user, args, val, time);
        }
        catch (e) {
            logger.emit('error', e);
        }
        logger.emit('cmd', cmd, val);
    }
    
    if (message.startsWith("Spookyubs ")) {
        let msg = message.substring(10);
        let m = msg.match(/remind me( to)?/i);
        if (m) {
            let to = !!msg.match(/remind me to/i);
            msg = msg.replace(/remind me( to)? /i, "");
            let temp = msg;
            let i = 0;
            if (!temp.match(/\sin\s/g)) {
                room = Rooms[room];
                if (user.can(room, "+")) {
                    room.send("Okay, I'll remind you in 3 hours.");
                    setTimeout(function() { room.send(msg) }, 1000*60*60*3);
                }
                else {
                    user.send("Okay, I'll remind you in 3 hours.");
                    setTimeout(function() { user.send(msg) }, 1000*60*60*3);
                }
                return;
            }
            while (temp.match(/\sin\s/g).length > 1) {
                temp = temp.replace('in', '[![![!]!]!]');
                i++;
            }
            let index = temp.indexOf(" in ") - (9*i);
            let part1 = msg.substring(0, index);
            let part2 = msg.substring(index+4);
            
            let time = 0;
            part2 = part2.replace(/hours/gi, 'hour');
            part2 = part2.replace(/minutes/gi, 'minute');
            part2 = part2.replace(/ and /gi, ',');
            let timeparts = part2.split(",");
            console.log(timeparts);
            for (let i in timeparts) {
                let tmp = timeparts[i].split(' ');
                if (tmp.length !== 2) return Rooms[room].send("I don't understand your time format.");
                if (toId(tmp[1]) !== 'hour' && toId(tmp[1]) !== 'minute') return Rooms[room].send("I can only process minutes and hours.");
                if (isNaN(parseInt(tmp[0]))) return Rooms[room].send(tmp[0] + " isn't a number.");
                let tm = parseInt(tmp[0]);
                if (toId(tmp[1]) === 'hour') tm *= 60;
                time += tm * 60 * 1000;
            }
            let ret = user.name + "! You wanted me to remind you " + (to ? "to " : "") + part1;
            room = Rooms[room];
            if (user.can(room, "+") || room === user) {
                room.send("Okay, will do.");
                setTimeout(function() { room.send(ret) }, time);
            }
            else {
                user.send("Okay, will do.");
                setTimeout(function() { user.send(ret) }, time);
            }
            //Rooms[room].send("In " + part2 + " you need to " + part1);
        }
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
        if (typeof Commands[cmd] === 'object') return; // Can't do that right now
        Commands[cmd](user, user, args, val);
        logger.emit('cmd', cmd, val);
    }
});

bot.on('j', (parts) => {
    let room = Utils.getRoom(parts[0]);
    let p = parts[2].substring(1).split("@")
    let user = parts[2].substring(0, 1) + p[0];
    console.log(user);
    if (!Users[toId(user)]) Users.add(user);
    Users[toId(user)].join(room, user);
});

bot.on('l', (parts) => {
    let room = Utils.getRoom(parts[0]);
    let p = parts[2].split("@")
    let user = toId(p[0]);
    // This sometimes crashes when PS sends a message to the client that a Guest is leaving the room when the guest never joined the room in the first place which honestly makes no sense.
    if (Users[user]) Users[user].leave(room);
    else logger.emit('error', `${user} can't leave ${room}`);
});

bot.on('n', (parts) => {
    let room = Utils.getRoom(parts[0]);
    let oldname = parts[3];
    let p = parts[2].substring(1).split("@")
    let newname = parts[2].substring(0, 1) + p[0]
    try {Rooms[room].rename(oldname, newname);}
    catch (e) {}
});

bot.on('deinit', (parts) => {
    let room = Utils.getRoom(parts[0]);
    if (Rooms[room]) Rooms[room].leave();
});

bot.on('tournament', (parts, data) => {
    let room = Rooms[Utils.getRoom(parts[0])];
    let dt = data.split('\n');
    dt.shift();
    for (let line of dt) {
        parts = line.split("|");
        let type = parts[2];
        if (type === "create") if (!room.tournament) room.startTour(false);
        if (type === "end" || type === "forceend") room.endTour();
    }
});

bot.on('dereg', (type, name) => {
    if (type === 'user') {
        Users[name].last = Date.now();
    }
    else if (type === 'room') {
        delete Rooms[name];
    }
    else logger.emit('error', 'Invalid dereg type: ' + type);
});

bot.on('init', (parts, data) => {
    let room = Utils.getRoom(parts[0]);
    logger.emit('log', 'Joined ' + room);
    Rooms.add(room);
    parts = data.split("\n");
    for (let l in parts) {
        let line = parts[l];
        let part = line.split('|');
        if (part[1] === 'title') Rooms[room].name = part[2];
        if (part[1] === 'users') {
            let users = part[2].split(',')
            for (let i in users) {
                let user = users[i];
                user = user.substring(0, 1) + user.substring(1).split("@")[0];
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