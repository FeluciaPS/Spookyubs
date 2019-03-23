
let isGenerator = function(arg) {
    if (arg.startsWith("rr")) {
        if (arg.length === 2) return true;
        if (parseInt(arg.substring(2))) return true;
        return false;
    }
    else if (arg.startsWith("e")) {
        if (arg.length === 1) return true;
        if (parseInt(arg.substring(1))) return true;
        return false;
    }
    else {
        return false;
    }
}

module.exports = {
    nfe: function (room, user, args, val) {
        if (room.id !== 'nfe') return;
        if (!user.can(room, '%')) return;
        if (room.tournament) return room.send("A tournament is already going on");
        let mode = "none";
        let meta = Banlist.nfe.meta;
        if (args) {
            if (args[1]) mode = toId(args[1]);
            meta = mode === "1v1" ? "1v1" : Banlist.nfe.meta;
            if (args[0].startsWith("Rules:")) {
                args[0] = "e";
                args[1] = "none";
                args[2] = val.substring(6);
            }
            if (args[0] && !isGenerator(args[0])) {
                args[1] = args[0];
                args[0] = "e";
            }
            if (args[0].startsWith("rr")) {
                let count = parseInt(args[0].substring(2));
                if (count) room.send(`/tour create ${meta}, rr,, ` + count);
                else room.send(`/tour create ${meta}, rr`);
            }
            else if (args[0].startsWith("e")){
                let count = parseInt(args[0].substring(1));
                if (count) room.send(`/tour create ${meta}, elim,, ` + count);
                else room.send(`/tour create ${meta}, elim`);
            }
            else {
                room.send(`/tour create ${meta}, elim`)
            }
        }
        else room.send(`/tour create ${meta}, elim`);

        // ----------- //
        // set ruleset //
        // ----------- //
        let ruleset = "/tour rules ";
        if (!args[2]) args[2] = "";
        
        // Tour mode things
        if (mode === "inverse") ruleset += "Inverse Mod, ";
        if (mode === "monotype") ruleset += "Same Type Clause, ";
        
        if (Banlist.nfe.bans.length) ruleset += "-" + Banlist.nfe.bans.join(", -");
        if (Banlist.nfe.unbans.length) ruleset += ", +" + Banlist.nfe.unbans.join(", +");
        
        // -------------------------------- //
        // Start sending things to the room //
        // -------------------------------- //
        room.send("!code " + ruleset + "\n");
        
        // Set tour name
		if (mode === "inverse") room.send("/tour name Inverse NFE");
        else if (mode === "monotype") room.send("/tour name Monotype NFE");
        else if (mode === "1v1") room.send("/tour name [Gen 7] NFE 1v1");
        else room.send("/tour name [Gen 7] NFE");
    }
}