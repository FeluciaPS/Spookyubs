
let canMakeTour = function(room, user) {
    // I'm gonna use this a lot so why not make a function for it
    if (room != '1v1' && room != '1v1typechallenge') return false;
    if (!user.can(room, "%")) return false;
    if (room.tournament) {
        room.send("A tournament is already going on.");
        return false;
    }
    return true;
}

module.exports = {
    chill: function(room, user, args) {
        if (!canMakeTour(room, user)) return;
        this['1v1'](room, user, ["rr"]);
        room.startTour("chill");
    },
    '1v1': function(room, user, args) {
        if (!canMakeTour(room, user)) return;
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
        if (args[0] === 'o') room.startTour("o"); // Make a tour object manually instead of doing it in parser so the "Official" flag can be passed
    },
    oras: 'gen61v1',
    gen61v1: function(room, user, args) {
        if (!canMakeTour(room, user)) return;
        if (args) {
            if (args[0].startsWith("rr")) {
                let count = parseInt(args[0].substring(2));
                if (count) room.send("/tour create gen61v1, rr,, " + count);
                else room.send("/tour create gen61v1, rr");
            }
            else if (args[0].startsWith("e")){
                let count = parseInt(args[0].substring(1));
                if (count) room.send("/tour create gen61v1, elim,, " + count);
                else room.send("/tour create gen61v1, elim");
            }
            else {
                room.send("/tour create gen61v1, elim")
            }
        }
        else room.send("/tour create gen61v1, elim");
        if (args[0] === 'o') room.startTour("o"); // Make a tour object manually instead of doing it in parser so the "Official" flag can be passed
    },
    aaa1v1: 'aaa',
    aaa: function(room, user, args) {
        if (!canMakeTour(room, user)) return;
        let ruleset = "/tour rules Ignore Illegal Abilities, -" + Banlist.aaa['ability-bans'].join(', -') + ", -" + Banlist.aaa['mon-bans'].join(', -'); // Yes I realize this doesn't properly work if there aren't any ability-bans or mon-bans. I'll tackle that if we ever get to that point
        this['1v1'](room, user, args);
        room.send(ruleset);
        room.send("/tour name [Gen 7] AAA 1v1");
    },
    ag1v1: 'ag',
    ag: function(room, user, args) {
        if (!canMakeTour(room, user)) return;
        let ruleset = "/tour rules !" + Banlist.ag.join(', !') + ", +" + Banlist['1v1'].join(', +');
        this['1v1'](room, user, args);
        room.send(ruleset);
        room.send("/tour name [Gen 7] AG 1v1");
    },
    inverse: function(room, user, args) {
        if (!canMakeTour(room, user)) return;
        let ruleset = "/tour rules Inverse Mod, "
        if (Banlist.inverse.bans.length) ruleset += "-" + Banlist.inverse.bans.join(", -") + ", ";
        if (Banlist.inverse.unbans.length) ruleset += "+" + Banlist.inverse.unbans.join(", +") + ", ";
        ruleset = ruleset.substring(0, ruleset.length - 2);
        this['1v1'](room, user, args);
        room.send(ruleset);
        room.send("/tour name [Gen 7] Inverse 1v1");
    },
    monotype: 'mono',
    mono: function(room, user, args) {
        if (!canMakeTour(room, user)) return;
        let ruleset = "/tour rules Same Type Clause, "
        if (Banlist.monotype.bans.length) ruleset += "-" + Banlist.monotype.bans.join(", -") + ", ";
        if (Banlist.monotype.unbans.length) ruleset += "+" + Banlist.monotype.unbans.join(", +") + ", ";
        ruleset = ruleset.substring(0, ruleset.length - 2);
        this['1v1'](room, user, args);
        room.send(ruleset);
        room.send("/tour name [Gen 7] Monotype 1v1");
    },
};