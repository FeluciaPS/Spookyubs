let t = JSON.parse(FS.readFileSync('data/types.json'));

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

let chooseMonopoke = function() {
    let mons = Object.keys(t);
    let mon = Math.floor(Math.random() * mons.length);
    mon = mons[mon];
    mon = t[mon];
    if (mon.species.indexOf("-") != -1) mon = chooseMonopoke();
    return mon.species;
}

module.exports = {
    monopoke: function(room, user, args) {
        if (!canMakeTour(room, user)) return;
        if (!args[0]) args[0] = chooseMonopoke();
        if (!t[toId(args[0])]) return room.send(`${args[0]} is not a Pokémon`);
        let mon = t[toId(args[0])].species;
        let ruleset = "/tour rules !Team Preview, -" + Banlist['1v1-allowed'].join(', -') + `, +${mon}`;
        this['1v1'](room, user, args);
        room.startTour("monopoke");
        room.send(ruleset);
        room.send("/tour name Monopoke " + mon);
        room.send(`/wall Monopoke ${mon}! Use only ${mon}`);
    }
}