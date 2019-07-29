let commands = {
    mail: function(room, user, args, val) {
        let target = args[0];
        let targetid = toId(target);
        let msg = val.substring(target.length + 1).trim();
        if (args.length < 2 || !targetid || !msg) return user.send("Usage: ``.mail [user], [message]``");
        let message = `[mail] ${user.name}: ${msg}`;
        if (message.length > 300) return user.send("Your message is too long...");
        if (Users[targetid]) {
            Users[targetid].send(message);
            return user.send("Mail sent successfully.");
        }
        FS.readFile(`mail/${targetid}.json`, (err, data) => {
            let maildata = [];
            if (err) {}
            else {
                try { maildata = JSON.parse(data); }
                catch (e) { };
            }
            if (maildata.length === Config.mail.inboxSize) return user.send("That user's mailbox is full.");
            maildata.push(message);
            FS.writeFile(`mail/${targetid}.json`, JSON.stringify(maildata, null, 4), (err) => {
                if (err) throw err;
                user.send("Mail sent successfully.");
            });
        });
    },  
    
    modnote: function(room, user, args, val) {
        console.log("test");
        if (room != user) return;
        console.log("test 2");
        if (!args[0]) return user.send("Usage: ``.modnote [room], [message]``");
        room = Utils.toRoomId(args[0]);
        console.log(Object.keys(Rooms));
        console.log(Rooms[room]);
        if (!Rooms[room]) return user.send("Room doesn't exist, or I'm not in it");
        let self = Users[toId(Config.username)];
        if (self.rooms[room] != "*") return user.send("I'm not a bot in that room");
        if (!user.can(room, "%")) return user.send('Access denied.');
        let escape = require('escape-html');
        let msg = val.substring(args[0].length + 1).trim();
        if (Config.devs.indexOf(user.id) == -1) msg = escape(msg);
        let ret = `/addrankhtmlbox %,<b>${escape(user.rooms[room])}${user.name}:</b> ${msg}<br><span style='color:#444444;font-size:10px'>Note: Only users ranked % and above can see this.</span>`
        Send(room, ret);
    },

    // Dev stuff
    git: function(room, user, args) {
        let target = user.can(room, '+') ? room : user;
        if (!target) target = user;
        let msg = "No git url is configured for this bot."
        if (Config.git) msg = Config.git;
        target.send(msg);
    },

    rl: 'reload',
    reload: function(room, user, args) {
        if (!user.can(room, 'all')) return;
        bot.emit('reload', args[0], room);
    },
    
    eval: function(room, user, args, val) {
        if (!user.can(room, 'all')) return;
        if (!room) room = user;
        if (!val) return;
        let ret = undefined;
        try {
            ret = eval(val);
        } catch (e) {
            ret = e;
        }
        if (ret !== undefined) {
            ret = ret.toString();
            if (ret.indexOf("\n") !== -1) ret = "!code " + ret;
            room.send(ret);
        }
    },
    
    ping: function(room, user, args) {
        if (!user.can(room, 'all')) return; 
        room.send("pong!");
    },
    
    join: 'joinroom',
    joinroom: function(room, user, args) {
        if (!user.can(room, 'all')) return;
        if (!args[0]) return user.send('No room given.');
        room.send('/j ' + args[0]);
    }
};

let files = FS.readdirSync('commands');
for (let f = 0; f < files.length; f++) {
    let file = files[f];
    if (file.substring(file.length-3) !== ".js") continue;
    if (require.cache[require.resolve('./commands/' + file)]) delete require.cache[require.resolve('./commands/' + file)];
    let contents = require('./commands/' + file);
    Object.assign(commands, contents);
}

module.exports = commands;