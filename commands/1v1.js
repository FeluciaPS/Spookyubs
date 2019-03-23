
let canMakeTour = function(room, user) {
    // I'm gonna use this a lot so why not make a function for it
    if (room != '1v1') return false;
    if (!user.can(room, "%")) return false;
    if (room.tournament) {
        room.send("A tournament is already going on.");
        return false;
    }
    return true;
}

module.exports = {
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
    }
};