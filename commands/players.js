module.exports = {    
    vs: 'viewstats',
    viewstats: function(room, user, args) {
        let targetroom = false;
        for (let r in Users.self.rooms) {
            if (Users.self.rooms[r] !== "*") continue;
            if (!user.rooms[r]) continue;
            targetroom = Rooms[r];
            break;
        }
        if (user.can(room, "+") && room !== user) targetroom = room;
        if (!targetroom) return user.send("Unable to send infobox, please join <<bd>> and try again.");
        let ret = (room == user || !user.can(room, "+") || !args[0]) ? `/pminfobox ${user.name}, ` : `/addhtmlbox `;
        
        if (!args[0]) {
            let player = Players.get(user.id);
            if (!player) return user.send("You do not have a character.");
            let text = player.buildVS(true);
            return targetroom.send(ret + text);
        }
        let target = toId(args[0])
        let player = Players.get(target);
        if (!player) return (user.can(room, "+") ? room : user).send("That user does not have a character.");
        let text = player.buildVS();
        return targetroom.send(ret + text);
    },
    vi: 'viewitems',
    viewitems: function(room, user, args) {
        let targetroom = false;
        for (let r in Users.self.rooms) {
            if (Users.self.rooms[r] !== "*") continue;
            if (!user.rooms[r]) continue;
            targetroom = Rooms[r];
            break;
        }
        if (user.can(room, "+") && room !== user) targetroom = room;
        if (!targetroom) return user.send("Unable to send infobox, please join <<bd>> and try again.");
        let ret = (room == user || !user.can(room, "+") || !args[0]) ? `/pminfobox ${user.name}, ` : `/addhtmlbox `;
        
        if (!args[0]) {
            let player = Players.get(user.id);
            if (!player) return user.send("You do not have a character.");
            let text = player.buildVI(true);
            return targetroom.send(ret + text);
        }
        let target = toId(args[0])
        let player = Players.get(target);
        if (!player) return (user.can(room, "+") ? room : user).send("That user does not have a character.");
        let text = player.buildVI();
        return targetroom.send(ret + text);
    },
    vl: 'viewlevels',
    viewlevels: function(room, user, args) {
        let targetroom = false;
        for (let r in Users.self.rooms) {
            if (Users.self.rooms[r] !== "*") continue;
            if (!user.rooms[r]) continue;
            targetroom = Rooms[r];
            break;
        }
        if (user.can(room, "+") && room !== user) targetroom = room;
        if (!targetroom) return user.send("Unable to send infobox, please join <<bd>> and try again.");
        let ret = (room == user || !user.can(room, "+") || !args[0]) ? `/pminfobox ${user.name}, ` : `/addhtmlbox `;
        
        if (!args[0]) {
            let player = Players.get(user.id);
            if (!player) return user.send("You do not have a character.");
            let text = player.buildVL(true);
            return targetroom.send(ret + text);
        }
        let target = toId(args[0])
        let player = Players.get(target);
        if (!player) return (user.can(room, "+") ? room : user).send("That user does not have a character.");
        let text = player.buildVL();
        return targetroom.send(ret + text);
    },
    regp: function(room, user, args) {
        if (!user.can("battledome", "+")) return;
        if (args.length < 3) return room.send("Usage: ``%regp [user], [class], [weapon]``");
        let target = args[0];
        let Class = Classes[toId(args[1])];
        let Weapon = Weapons[toId(args[2])];
        if (!Class) return room.send("Invalid class. Available classes: " + Classes);
        if (!Weapon) return room.send("Invalid weapon. Available weapons: " + Weapons);
        if (Players.get([toId(target)])) return room.send("That player already has a character.");
        if (Users[toId(target)]) target = Users[toId(target)].name;
        Players.add(target, Class, Weapon);
        return room.send("Player " + target + " successfully added.");
    },
    
    // SW, SC and SCO
    sw: 'switchweapon',
    switchweapon: function(room, user, args) {
        if (!user.can(room, "%") || !(room.is('game'))) room = user;
        let player = Players.get(user.id);
        if (!player) return room.send("You do not have a character.");
        if (player.game) return room.send("You can't change your weapon while you're in a game.");
        
        let target = toId(args[0]);
        if (target === "random") target = Weapons.random();
        let res = player.sw(target);
        if (res) room.send(res);
    },
    
    sc: 'switchclass',
    switchclass: function(room, user, args) {
        if (!user.can(room, "%") || !(room.is('game'))) room = user;
        let player = Players.get(user.id);
        if (!player) return room.send("You do not have a character.");
        if (player.game) return room.send("You can't change your class while you're in a game.");
        
        let target = toId(args[0]);
        if (target === "random") target = Classes.random();
        let res = player.sc(target);
        if (res) room.send(res);
    },
    
    sco: 'switchcombo',
    switchcombo: function(room, user, args) {
        if (!user.can(room, "%") || !(room.is('game'))) room = user;
        let arg = args;
        if (arg[0] === "random") arg = [Classes.random(), Weapons.random()]; 
        if (arg.length === 1) arg = args[0].split("/");
        if (arg.length < 2) return room.send("Usage: ``%sco [weapon], [class]``");
        
        let player = Players.get(user.id);
        if (!player) return room.send("You do not have a character.");
        if (player.game) return room.send("You can't change your class while you're in a game.");
        
        let res = player.sco(arg[0], arg[1]);
        if (res) room.send(res);
    },
    
    // XP, Gold, loot and levelups
    loot: function(room, user, args) {
        if (!user.can("battledome", "+")) return;
        
        let getBase = function(type) {
            if (!isNaN(parseInt(type))) return parseInt(type);
            let mul = type.charAt(0) === "-" ? -1 : 1;
            type = type.substring(1);
            if (!type.match(/\d+/)) return false;
            let a = parseInt(type.match(/\d+/)[0]);
            let loot = false;
            if (type.match(/\dppvp/i)) loot = a + 1;
            if (type.match(/\dpffa/i)) loot = a + 2;
            if (type.match(/\dpvpvp/i)) loot = a + 2;
            if (type.match(/\dpjugg/i)) loot = a + 1;
            if (type.match(/\dvjugg/i)) loot = a + 2;
            if (type.match(/\dpntr/i)) loot = Math.ceil(a / 2);
            return mul * loot;
        }
        
        let type = getBase(args.shift());
        if (!type || args.length < 1) return room.send("Invalid loot format. Usage: ``%loot [type/amount], [user1], [user2], ...``");
        
        let success = [];
        let failure = [];
        for (let i of args) {
            let p = Players.get(toId(i));
            if (!p) {
                failure.push(i);
                continue;
            }
            success.push(p.name);
            p.xp += type;
            p.gold += type;
            p.totalxp += type;
            p.save();
        }
        
        let ret = "/addhtmlbox ";
        if (success.length) ret += "Experience and Gold successfully given to " + Utils.natList(success);
        if (success.length && failure.length) ret += "<br>";
        if (failure.length) ret += "<span style='font-size:10px'>Experience and Gold unable to be given to " + Utils.natList(failure) + "</span>";
        return Rooms['battledome'].send(ret);
    },
    xp: function(room, user, args) {
        if (!user.can("battledome", "+")) return;
        
        let getBase = function(type) {
            if (!isNaN(parseInt(type))) return parseInt(type);
            let mul = type.charAt(0) === "-" ? -1 : 1;
            type = type.substring(1);
            if (!type.match(/\d+/)) return false;
            let a = parseInt(type.match(/\d+/)[0]);
            let loot = false;
            if (type.match(/\dppvp/i)) loot = a + 1;
            if (type.match(/\dpffa/i)) loot = a + 2;
            if (type.match(/\dpvpvp/i)) loot = a + 2;
            if (type.match(/\dpjugg/i)) loot = a + 1;
            if (type.match(/\dvjugg/i)) loot = a + 2;
            if (type.match(/\dpntr/i)) loot = Math.ceil(a / 2);
            return mul * loot;
        }
        
        let type = getBase(args.shift());
        if (!type || args.length < 1) return room.send("Invalid loot format. Usage: ``%xp [type/amount], [user1], [user2], ...``");
        
        let success = [];
        let failure = [];
        for (let i of args) {
            let p = Players.get(toId(i));
            if (!p) {
                failure.push(i);
                continue;
            }
            success.push(p.name);
            p.xp += type;
            p.totalxp += type;
            p.save();
        }
        
        let ret = "/addhtmlbox ";
        if (success.length) ret += "Experience successfully given to " + Utils.natList(success);
        if (success.length && failure.length) ret += "<br>";
        if (failure.length) ret += "<span style='font-size:10px'>Experience unable to be given to " + Utils.natList(failure) + "</span>";
        return Rooms['battledome'].send(ret);
    },
    gold: function(room, user, args) {
        if (!user.can("battledome", "+")) return;
        
        let getBase = function(type) {
            if (!isNaN(parseInt(type))) return parseInt(type);
            let mul = type.charAt(0) === "-" ? -1 : 1;
            type = type.substring(1);
            if (!type.match(/\d+/)) return false;
            let a = parseInt(type.match(/\d+/)[0]);
            let loot = false;
            if (type.match(/\dppvp/i)) loot = a + 1;
            if (type.match(/\dpffa/i)) loot = a + 2;
            if (type.match(/\dpvpvp/i)) loot = a + 2;
            if (type.match(/\dpjugg/i)) loot = a + 1;
            if (type.match(/\dvjugg/i)) loot = a + 2;
            if (type.match(/\dpntr/i)) loot = Math.ceil(a / 2);
            return mul * loot;
        }
        
        let type = getBase(args.shift());
        if (!type || args.length < 1) return room.send("Invalid loot format. Usage: ``%xp [type/amount], [user1], [user2], ...``");
        
        let success = [];
        let failure = [];
        for (let i of args) {
            let p = Players.get(toId(i));
            if (!p) {
                failure.push(i);
                continue;
            }
            success.push(p.name);
            p.gold += type;
            p.save();
        }
        
        let ret = "/addhtmlbox ";
        if (success.length) ret += "Gold successfully given to " + Utils.natList(success);
        if (success.length && failure.length) ret += "<br>";
        if (failure.length) ret += "<span style='font-size:10px'>Gold unable to be given to " + Utils.natList(failure) + "</span>";
        return Rooms['battledome'].send(ret);
    }
}