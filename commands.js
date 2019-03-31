global.Banlist = JSON.parse(FS.readFileSync('data/banlist.json'));
global.PokeDex = require('./data/pokedex.js');


let commands = {
    // Utilities
    stat: function(room, user, args) {
        let target = user.can(room, '+') ? room : user;
        args = args[0].split(" ");
        let pokemon = args[0];
        let stat = toId(args[1]);
        let invest = args[2];
        let boost = args[3];
        let stats = ["hp", "atk", "def", "spa", "spd", "spe"];
        
        if (!pokemon) {
            Send(room, "Usage: .stat [pokemon], [hp/atk/def/spa/spd/spe], [ivs:evs], [boost]");
            return [null];
        }
        
        if (!stat || stats.indexOf(stat) === -1) {
            Send(room, "No valid stat given. (hp/atk/def/spa/spd/spe)");
            return [null];
        }
        
        if (!invest) invest = "0";
        if (!boost) boost = "0";
        let invests = invest.split(":");
        let ev, iv, nature = 1;
        if (invests[1]) {
            if (invests[1].indexOf("+") != -1) {
                nature = "1.1";
                invests[1] = invests[1].substring(0, invests[1].length - 1);
            }
            if (invests[1].indexOf("-") != -1) {
                nature = "0.9";
                invests[1] = invests[1].substring(0, invests[1].length - 1);
            }
            ev = parseInt(invests[1]);
            iv = parseInt(invests[0]);
        }
        else {
            if (invests[0].indexOf("+") != -1) {
                nature = "1.1";
                invests[0] = invests[0].substring(0, invests[0].length - 1);
            }
            if (invests[0].indexOf("-") != -1) {
                nature = "0.9";
                invests[0] = invests[0].substring(0, invests[0].length - 1);
            }
            ev = parseInt(invests[0]);
            iv = 31; 
        }
        let mon = PokeDex[toId(pokemon)];
        if (!mon) {
            Send(room, `${pokemon} is not a valid pokemon`);
            return [null];
        }

        if (boost.startsWith("+")) {
            boost = 1 + 0.5 * parseInt(boost.substring(1));
        }
        else if (boost.startsWith("-")) {
            boost = 1 / (1 + 0.5 * parseInt(boost.substring(1)));
        }
        else {
            boost = 1;
        }

        // Check for dumb shit
        if (boost > 4 || boost < 0.25) {
            Send(room, "Boost must be between +6 and -6");
            return [null]
        }

        if (ev > 252 || ev < 0) {
            Send(room, "ev must be between 0 and 252");
            return [null]
        }

        if (iv > 31 || iv < 0) {
            Send(room, "iv must be between 0 and 31");
            return [null];
        }

        let fin = 0;
        if (stat === "hp") {
            fin = Math.floor(mon.baseStats[stat] * 2 + iv + (ev / 4) + 110); 
        }
        else {
            fin = Math.floor((mon.baseStats[stat] * 2 + iv + (ev / 4) + 5) * nature);
            fin = Math.floor(fin * boost);
        }

        room.send(fin)
    },
    hangman: function(room, user, args) {
        if (!user.can(room, '%')) return;
        if (room != '1v1typechallenge') return;
        if (room.tournament) return room.send("You can't play hangman while a tournament is going on");
        let dex = JSON.parse(FS.readFileSync('data/types.json'));
        let mons = Object.keys(dex);
        let mon = dex[Utils.select(mons)];
        room.send(`/hangman create ${mon.species}, Generation ${mon.gen}`);
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
    
    // Staff things 
    settype: 'st',
    st: function(room, user, args) {
        if (!user.can(room, '%')) return;
        let type = args[0];
        if (!type) return;
        console.log(type);
        if (type.startsWith("rr")) {
            let count = parseInt(type.substring(2));
            if (count) room.send("/tour settype rr,, " + count);
            else room.send("/tour settype rr");
        }
        else if (type.startsWith("e")){
            let count = parseInt(type.substring(1));
            if (count) room.send("/tour settype elim,, " + count);
            else room.send("/tour settype elim");
        }
        else {
            room.send('Invalid type.');
        }
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
        if (!room) room = user;
        bot.emit('reload', args[0], room);
    },
    
    eval: function(room, user, args, val) {
        if (!user.can(room, 'all')) return;
        if (!room) room = user;
        if (!val) return;
        let ret = eval(val)
        if (ret !== undefined) {
            ret = ret.toString();
            if (ret.indexOf("\n") !== -1) ret = "!code " + ret;
            room.send(ret);
        }
    },
    
    ping: function(room, user, args) {
        if (!user.can(room, 'all')) return; 
        if (!room) room = user;
        room.send("pong!");
    },
    
    join: 'joinroom',
    joinroom: function(room, user, args) {
        if (!user.can(room, 'all')) return;
        if (!args[0]) return user.send('No room given.');
        Send('', '/j ' + args[0]);
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