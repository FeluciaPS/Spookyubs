global.Banlist = JSON.parse(FS.readFileSync('data/banlist.json'));

let commands = {
    modnote: function(room, user, args, val) {
        if (!!room) return;
        if (!args[0]) return user.send("Usage: ``.modnote [room], [message]``");
        room = toId(args[0]);
        if (!Rooms[room]) return user.send("Room doesn't exist, or I'm not in it");
        let self = Users[toId(Config.username)];
        if (self.rooms[room] != "*") return user.send("I'm not a bot in that room");
        if (!user.can(room, "%")) user.send('Access denied.');
        let escape = require('escape-html');
        let msg = escape(val.substring(args[0].length + 1).trim());
        let ret = `/addrankhtmlbox %,<b>${escape(user.rooms[room])}${user.name}:</b> ${msg}<br><span style='color:#444444;font-size:10px'>Note: Only users ranked % and above can see this.</span>`
        Send(room, ret);
    },
    git: function(room, user, args) {
        let pm = !user.can(room, '+');
        let msg = "No git url is configured for this bot."
        if (Config.git) msg = Config.git;
        if (pm) user.send(msg);
        else room.send(msg);
    },
    tc: function (room, user, args) {
        if (room != '1v1typechallenge') return;
        if (!user.can(room, '%')) return;
        if (!args[0]) return room.send('Invalid type.');
        let type = args[0].capitalize();
        if (toId(args[0]) === "rt" || toId(args[0]) === "random") type = Utils.select(Object.keys(Banlist.tc));
        if (!Banlist.tc[type]) return room.send('Invalid type: ' + type);
        let dex = JSON.parse(FS.readFileSync('data/types.json'));
        let unbano = {};
        for (let i in dex) {
            let mon = dex[i];
            if (Banlist['1v1'].indexOf(mon.species) !== -1) continue;
            if (mon.types.indexOf(type) !== -1) unbano[i] = true;
        }
        let bans = [];
        for (let i in Banlist.tc[type]) {
            let ban = Banlist.tc[type][i];
            if (unbano[toId(ban)]) delete unbano[toId(ban)];
            else bans.push(ban);
        }
        
        // These lines exist because PartMan complained
        let unbans = []
        for (let i in unbano) {
            unbans.push(dex[i].species);
        }
        let ruleset = '/tour rules -OU, -UU, -RU, -NU, -PU, -ZU, -NFE, -LC, -Uber, -UUBL, -RUBL, -NUBL, -PUBL, -NFE, -LC Uber';
        if (bans.length) ruleset += ', -' + bans.join(', -');
        ruleset += ', +' + unbans.join(', +');
        this['1v1'](room, user, ['rr2']);
        room.send(ruleset);
        room.send('/tour name Type Challenge: ' + type + "!");
        room.send('$settype ' + type)
    },
    rt: function(room, user, args) {
        let pm = !user.can(room, '+');
        let type = Utils.select(Object.keys(Banlist.tc));
        if (pm) user.send(type);
        else room.send(type);
    },
    '1v1': function(room, user, args) {
        if (!user.can(room, '%')) return;
        if (args) {
            if (args[0].startsWith("rr")) {
                let count = parseInt(args[0].substring(2));
                if (count) room.send("/tour create 1v1, rr,, " + count);
                else room.send("/tour create 1v1, rr");
            }
            else if (args[0].startsWith("e")){
                let count = parseInt(args[0].substring(1));
                if (count) room.send("/tour create 1v1, elim,, " + count);
                else room.send("/tour create 1v1, elim");
            }
            else {
                room.send("/tour create 1v1, elim")
            }
        }
        else room.send("/tour create 1v1, elim");
    },
    rl: 'reload',
    reload: function(room, user, args) {
        if (!user.can(room, 'all')) return;
        bot.emit('reload', args[0], room);
    },
    eval: function(room, user, args, val) {
        if (!user.can(room, 'all')) return;
        let ret = eval(val)
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
    mail: function(room, user, args, val) {
        let target = args[0];
        let targetid = toId(target);
        let msg = val.substring(target.length + 1).trim();
        if (args.length < 2 || !targetid || !msg) return user.send("Usage: ``.mail [user], [message]``");
        let message = `[mail] ${user.name}: ${msg}`;
        if (message.length > 300) return user.send("Your message is too long...");
        if (Users[targetid]) return Users[targetid].send(message);
        FS.readFile(`mail/${targetid}.json`, (err, data) => {
            let maildata = [];
            if (err) {}
            else maildata = JSON.parse(data);
            if (maildata.length === Config.mail.inboxSize) return user.send("That user's mailbox is full.");
            maildata.push(message);
            FS.writeFile(`mail/${targetid}.json`, JSON.stringify(maildata, null, 4), (err) => {
                if (err) throw err;
                user.send("Mail sent successfully.");
            });
        });
    },
    settype: 'st',
    st: function(room, user, args) {
        if (!user.can(room, '%')) return;
        let type = args[0];
        if (!type) return;
        
        if (type.startsWith("rr")) {
            let count = parseInt(type.substring(2));
            if (count) room.send("/tour settype rr,, " + count);
            else room.send("/tour settype, rr");
        }
        else if (type.startsWith("e")){
            let count = parseInt(type.substring(1));
            if (count) room.send("/tour settype, elim,, " + count);
            else room.send("/tour settype, elim");
        }
        else {
            room.send('Invalid type.');
        }
    },
    hangman: function(room, user, args) {
        if (!user.can(room, '%')) return;
        if (room != '1v1typechallenge') return;
        if (room.tournament) return room.send("You can't play hangman while a tournament is going on");
        let dex = JSON.parse(FS.readFileSync('data/types.json'));
        let mons = Object.keys(dex);
        let mon = dex[Utils.select(mons)];
        room.send(`/hangman create ${mon.species}, Generation ${mon.gen}`);
    }
};

let files = FS.readdirSync('commands');
for (let f in files) {
    let file = files[f];
    if (file.substring(file.length-3) !== ".js") continue;
    let contents = require('./commands/' + file);
    Object.assign(commands, contents);
}

module.exports = commands;