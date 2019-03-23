
module.exports = {
    tc: function (room, user, args) {
        if (room != '1v1typechallenge') return;
        if (!user.can(room, '%')) return;
        if (room.tournament) return room.send("A tournament is already going on");
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
        let target = user.can(room, '+') ? room : user;
        let type = Utils.select(Object.keys(Banlist.tc));
        target.send(type);
    },
}