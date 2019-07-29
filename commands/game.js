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
    }
}