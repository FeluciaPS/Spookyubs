let doRoll = function(roll, room, user) {
    if (!roll) roll = "20";
    
    roll = roll.toString().split("//")[0];
    
    if (!roll) roll = "20";
    let add = roll.indexOf("+");
    let sub = roll.indexOf("-");
    let index = -1;
    if (add > sub) {
        if (sub !== -1) index = sub;
        else index = add;
    }
    if (sub > add) {
        if (add !== -1) index = add;
        else index = sub;
    }
    
    let addition = index == -1 ? false : roll.substring(index); // We'll come back to this later
    if (index !== -1) roll = roll.substring(0, index);
    
    roll = roll.split("d");
    if (roll.length > 2) return room.send("Invalid dice format.");
    let dice = roll[0];
    let faces = roll[1];
    if (roll.length === 1) {
        faces = roll[0];
        dice = "1";
    }
    else {
        if (!dice) dice = "1";
        if (!faces) faces = "20";
    }
    
    dice = parseInt(dice);
    faces = parseInt(faces);
    if (isNaN(dice) || isNaN(faces)) return room.send("Invalid dice format.");
    let rolls = [];
    let total = 0;
    for (let i = 0; i < dice; i++) {
        let roll = Math.floor(Math.random() * faces) + 1;
        rolls.push(roll);
        total += roll;
    }
    if (addition) {
        let addit = 0;
        addition = addition.split('');
        let cur = addition.shift();
        let cv = "";
        for (let ch of addition) {
            if (ch === "+" || ch === "-") {
                if (!cv) return room.send("Invalid dice format.");
                cv = parseInt(cv);
                if (isNaN(cv)) return room.send("Invalid dice format.");
                if (cur === "+") addit += cv;
                else addit -= cv;
                cv = "";
                cur = ch;
                continue;
            }
            if ("0123456789".indexOf(ch) !== -1) {
                cv += ch;
                continue;
            }
            if (ch === " ") continue;
            return room.send("Invalid dice format.");
        }
        
        console.log(cv);
        if (!cv) return room.send("Invalid dice format.");
        cv = parseInt(cv);
        if (isNaN(cv)) return room.send("Invalid dice format.");
        if (cur === "+") addit += cv;
        else addit -= cv;
        total += addit;
    }
    
    let msg = "Rolls: " + rolls.join(", ") + " <b>||</b> Total: " + total;
    if (msg.length > 300) {
        if (user.can(room, "#")) msg = "/addhtmlbox " + msg.replace("**||**", "<b>||</b>"); 
        else msg = "I can't fit that many rolls into a message...";
    }
    return [rolls, msg, total];
}

module.exports = {
    roll: 'r',
    dice: 'r',
    r: function(room, user, args) {
        if ((!user.can(room, 'apph')) || !room.is('game')) return;
        args = args.join(", ").split("//")[0].split(", ");
        if (args.length === 1) {
            let ret = doRoll(args[0], room, user);
            if (!ret) return;
            room.send(ret[1].replace("<b>", "**").replace("</b>", "**"));
        }
        else if (args.length >= 5) {
            return room.send("I can do at most 4 different rolls at once.");
        }
        else {
            let ret = "/addhtmlbox ";
            let total = 0;
            for (let i of args) {
                let rolls = doRoll(i, room);
                if (!rolls) return;
                ret += rolls[1] + "<br>";
                total += rolls[2];
            }
            ret += "<b>Total:</b> " + total;
            room.send(ret);
        }
    },
    host: function(room, user, args) {
        if (!user.can('battledome', 'apph') || !room.is('game+')) return;
        if (!user.can('battledome', '+')) args[0] = user.name;
        if (!args[0]) args[0] = user.name;
        let player = Players.get(toId(args[0]));
        if (!player) return room.send(`${args[0]} does not have a character.`);
        if (player.host) return room.send(`${player.name} already has keys to squad ${player.host.squad}, please dehost them first before trying to host them again.`);
        let squad = Games.add(player.id);
        room.send(`${player.name} was handed the keys to squad ${squad}`);
    },
    dehost: function(room, user, args) {
        if (!user.can(room, 'host+') || !room.is('game+')) return;
        if (!user.can('battledome', '+')) args[0] = user.name;
        if (!args[0]) args[0] = user.name;
        let player = Players.get(toId(args[0]));
        if (!player.host) return (user.can('battledome', '+') ? room : user).send((player.id === user.id ? "You are" : `${player.name} is`) + "n't hosting a game."); // this is a mess I'll change it later
        Games.remove(player.host.squad);
        room.send("dehosted.");
    },
    setmap: function(room, user, args) {
        if (!room.is('game')) return;

        let player = Players.get(user.id);
        if (!player) return user.send("You don't have a character");
        if (!player.host) return user.send("You're not hosting anything");
        let mapname = toId(args[0]);
        if (!mapname) return room.send("That's not a valid map name");
        player.host.map = mapname;
        player.host.save();
        room.send("Map (probably) set to ``" + mapname + "``.");
    },
    gento: function(room, user, args) {
        if (!room.is('game')) return;

        let player = Players.get(user.id);
        if (!player) return user.send("You don't have a character");
        if (!player.host) return user.send("You're not hosting anything");
        let entities = {};
        for (let i of player.host.entities.playerlist) {
            entities[i.name] = i.mp + Math.floor(Math.random() * 8); // + 1 but for a true d8 but it literally doesn't matter
        }
        let tuples = Object.keys(entities).map(function(key) {
          return [key, entities[key]];
        });
        tuples.sort(function(first, second) {
          return second[1] - first[1];
        });
        player.host.to = tuples;
        return room.send("The following turn order has been generated: " + tuples.map(tup => tup[0]).join(", "));
    },
    map: function(room, user, args) {
        if (!room.is('game')) return;

        let player = Players.get(user.id);
        if (!player) return user.send("You don't have a character");
        if (!player.host) return user.send("You're not hosting anything");
        
        
        let css = args[0] === "css";
        room.send("/addhtmlbox " + player.host.buildMap(css));
    },
    addp: function(room, user, args) {
        if (!room.is('game')) return;

        let player = Players.get(user.id);
        if (!player) return user.send("You don't have a character");
        if (!player.host) return user.send("You're not hosting anything");
        let target = Players.get(toId(args[0]));
        if (!target) return room.send("Target doesn't have a character.");
        if (target.game) return room.send("Target is already in a game.");
        player.host.addp(toId(args[0]));
        target.game = player.host;
        room.send(`${target.name} successfully added to the game`);
    },
    info: function(room, user, args) {
        if (!room.is('game')) return;

        let player = Players.get(user.id);
        if (!player) return user.send("You don't have a character");
        if (!player.host) return user.send("You're not hosting anything");
        
        let ret = `<div style="width:auto; height:auto; overflow:auto;"><details OPEN><summary>Map</summary>`;
        ret += player.host.buildMap();
        ret += "</details><details OPEN><summary>Player List</summary>";
        ret += player.host.buildPL();
        ret += "</details></div>"
        room.send("/addhtmlbox " + ret);
    },

    move: function(room, user, args) {
        if (!room.is('game')) return;

        let player = Players.get(user.id);
        if (!player || !player.host && !player.game) return;
        let game = args[2] ? player.host : player.game;
        let target = args[2] ? args[2] : player.id;
        
        let ent = game.getPlayer(target)
        let letters = "abcdefghijklmnopqrstuvwxyz";
        let x = letters.indexOf(toId(args[0]));
        let y = parseInt(args[1]) - 1;
        if (x === -1 || isNaN(y) || y < 0) return room.send("Correct format: ``%move [letter], [number], [user]``");
        ent.pos = [x, y];
        game.save();
    },
    hp: function(room, user, args) {
        if (!room.is('game')) return;

        let player = Players.get(user.id);
        if (!player || !player.host && !player.game) return;
        let game = args[1] ? player.host : player.game;
        let targets = args[1] ? args : [player.id];
        
        let amount = parseInt(args.shift());
        if (isNaN(amount)) return room.send("Correct format: ``%hp [amount], [player1], [player2], ...")
        for (let i of targets) {
            if (!game.getPlayer(i)) return room.send("Invalid player: " + i);
        }
        for (let i of targets) {
            game.getPlayer(i).curhp += amount;
        }
        game.save();
    },
}