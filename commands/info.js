let buildWT = function(obj) {
    if (obj.Level) {
        // We're dealing with a Weapon or Class ability
        let text = `<b>${obj.nom}</b>`;
        text += ` - ${obj.Level}<br>`;
        text += `<b>Frequency:</b> ${obj.Frequency}<br>`;
        text += `<b>Miss Rate:</b> ${obj.Accuracy}<br>`;
        text += `<b>Roll:</b> ${obj.Roll}<br>`;
        text += `<b>Type:</b> ${obj.Type}<br>`;
        text += `<b>Range:</b> ${obj.Target}<br><br>`;
        text += `${obj.Desc}`;
        return text;
    }
    else if (obj.price) {
        // We're dealing with an item
        let boost = "";
        for (let i in obj.boost) {
            boost += (obj.boost[i] > 0 ? "+" : "") + obj.boost[i] + " " + i.toUpperCase() + " ";
        }
        if (!boost) boost = "-";
        
        let material = "";
        for (let i in obj.materials) {
            material += ", " + obj.materials[i] + "x " + i.capitalize();
        }
        if (material != "") material = material.substring(2);
        else material = "-";
        text = '<b>' + obj.nom + '</b><br/>' + obj.class + ' Rank ' + obj.type + '<br/> <b>Frequency: </b>' + obj.frequency + '<br/><b>Boosts: </b>' + boost.trim() + '<br/><b>Price: </b>' + obj.price + '<br/>' + (obj.achievement ? '<b>Achievement Required: </b>' + obj.achievement : '<b>Materials: </b>' + material ) + '<br/><br/>' + obj.effect;
        return text;
    }
    // Unknown type.
    else {
        return "<span style='color:red'>Invalid format for item <b>" + target + "</b>. Please contact a staff member</span>";
    }
}

module.exports = {
    rf: function(room, user, args) {
        if (!user.can(room, "+")) room = user;
        let target = args[0];
        if (!target) return room.send("I'm not sure what you mean.");
        target = toId(target);
        if (!Reference[target]) return room.send("I'm not sure what you mean.");
        return room.send(Reference[target]);
    },
    wt: function(room, user, args) {
        let targetroom = false;
        for (let r in Users.self.rooms) {
            if (Users.self.rooms[r] !== "*") continue;
            if (!user.rooms[r]) continue;
            targetroom = Rooms[r];
            break;
        }
        if (user.can(room, "+") && room !== user) targetroom = room;
        if (!targetroom) return user.send("Unable to send infobox, please join <<bd>> and try again.");
        let ret = (room == user || !user.can(room, "+")) ? `/pminfobox ${user.name}, ` : `/addhtmlbox `;
        
        let target = args[0];
        if (!target) return targetroom.send(ret + "I'm not sure what you mean.");
        target = toId(target);
        let result = WhatIs[target];
        if (target in Weapons || target.substring(0, target.length - 1) in Weapons || target in Classes || target.substring(0, target.length - 1) in Classes || target in Branches) result = true; // A bunch of cases in which the wt entry needs to be built on the fly, instead of just throwing it at the player
        if (!result) return targetroom.send(ret + "I'm not sure what you mean.");
        
        if (typeof result === "string" && result.startsWith("==")) result = WhatIs[result.substring(2)];
        if (typeof result === "string") return targetroom.send(ret + result);
        
        // We're dealing with an object
        if (result !== true) {
            let html = buildWT(result);
            return targetroom.send(ret + html);
        }
        
        
        // Special cases
        if (target in Weapons) {
            let weapon = Weapons[target];
            let moves = [];
            for (let i in weapon.moves) {
                let move = weapon.moves[i];
                if (typeof move !== "string") for (let m of move) moves.push(m);
                else moves.push(move);
            }
            moves = Object.assign([], moves);
            let last = moves.pop();
            let text = `${weapon.nom} has these abilities: ${moves.join(", ")} and ${last}.`;
            return targetroom.send(ret + text);
        }
        // Maybe it's trying to pull move data from a weapon
        if (target.substring(0, target.length - 1) in Weapons) {
            let weapon = Weapons[target.substring(0, target.length - 1)];
            let level = parseInt(target.substring(target.length - 1));
            if (isNaN(level) || level < 1 || level > 7) return room.send("I'm not sure what you mean.");
            let moves = weapon.moves[level];
            if (typeof moves === "string") {
                result = WhatIs[toId(moves)];
                console.log(result);
                if (!result) return room.send("Something went wrong. Please contact UnleashOurPassion and tell him what you did.");
                let text = buildWT(result);
                return room.send(ret + text);
            }
            else {
                moves = Object.assign([], moves);
                let last = moves.pop();
                return room.send(ret + `${weapon.nom} has the following abilities at level ${level}: ${moves.join(", ")}${moves.length ? " and " : ""}${last}`);
            }
        }
        
        // Same thing but for classes
        if (target in Classes) {
            let Class = Classes[target];
            let moves = [];
            for (let i in Class.moves) {
                let move = Class.moves[i];
                if (typeof move !== "string") for (let m of move) moves.push(m);
                else moves.push(move);
            }
            moves = Object.assign([], moves);
            let last = moves.pop();
            let text = `${Class.nom} has these abilities: ${moves.join(", ")} and ${last}.`;
            return targetroom.send(ret + text);
        }
        
        // And again, move data exists
        if (target.substring(0, target.length - 1) in Classes) {
            let Class = Classes[target.substring(0, target.length - 1)];
            let level = parseInt(target.substring(target.length - 1));
            if (isNaN(level) || level < 1 || level > 7) return room.send("I'm not sure what you mean.");
            let moves = Class.moves[level];
            if (typeof moves === "string") {
                result = WhatIs[toId(moves)];
                console.log(result);
                if (!result) return room.send("Something went wrong. Please contact UnleashOurPassion and tell him what you did.");
                let text = buildWT(result);
                return room.send(ret + text);
            }
            else {
                moves = Object.assign([], moves);
                let last = moves.pop();
                return room.send(ret + `${Class.nom} has the following abilities at level ${level}: ${moves.join(", ")}${moves.length ? " and " : ""}${last}`);
            }
        }
        
        // Also branches
        if (target in Branches) {
            let weapons = Object.assign([], Branches[target]);
            let last = weapons.pop();
            let text = `${target} has these weapons: ${weapons.join(", ")} and ${last}.`;
            return targetroom.send(ret + text);
        }
    },
}