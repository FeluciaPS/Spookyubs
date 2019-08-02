let fs = require('fs');
// Add all %rf entries
global.Reference = {};

let files = FS.readdirSync("./data/rf");
for (let f = 0; f < files.length; f++) {
    let file = files[f];
    if (file.substring(file.length-5) !== ".json") continue;
    let path = "./data/rf/" + file;
    Object.assign(Reference, JSON.parse(FS.readFileSync(path)));
}


// Add stray %wt entries
global.WhatIs = {};
files = FS.readdirSync("./data/wt");
for (let f = 0; f < files.length; f++) {
    let file = files[f];
    if (file.substring(file.length-5) !== ".json") continue;
    let path = "./data/wt/" + file;
    Object.assign(WhatIs, JSON.parse(FS.readFileSync(path)));
}

// Add Weapons, Branches and Classes
global.Weapons = {};
global.Branches = {};
files = FS.readdirSync("./data/weapon");
for (let f = 0; f < files.length; f++) {
    let file = files[f];
    if (file.substring(file.length-5) !== ".json") continue;
    let path = "./data/weapon/" + file;
    let wn = toId(file.substring(0, file.length-5))
    let data = JSON.parse(FS.readFileSync(path));
    if (!data.branch) continue;
    Weapons[wn] = data;
    let branch = data.branch;
    if (!Branches[branch]) Branches[branch] = [];
    Branches[branch].push(wn);
    if (Weapons[wn].alts) for (let i of Weapons[wn].alts) Weapons[toId(i)] = Weapons[wn];
}

global.Classes = {};
files = FS.readdirSync("./data/class");
for (let f = 0; f < files.length; f++) {
    let file = files[f];
    if (file.substring(file.length-5) !== ".json") continue;
    let path = "./data/class/" + file;
    let cn = toId(file.substring(0, file.length-5))
    Classes[cn] = JSON.parse(FS.readFileSync(path));
    if (Classes[cn].alts) for (let i of Classes[cn].alts) Classes[toId(i)] = Classes[cn];
}

Weapons.toString = Classes.toString = function() {
    let noms = [];
    for (let i in this) {
        let Weapon = this[i].nom;
        if (!Weapon) continue;
        if (noms.indexOf(Weapon) == -1) noms.push(Weapon);
    }
    let last = noms.pop();
    return noms.join(", ") + " and " + last;
}

Weapons.random = Classes.random = function() {
    let noms = [];
    for (let i in this) {
        let Weapon = this[i].nom;
        if (!Weapon) continue;
        if (noms.indexOf(Weapon) == -1) noms.push(Weapon);
    }
    return Utils.select(noms);
}

// Add Items
global.Items = {};
files = FS.readdirSync("./data/items");
for (let f = 0; f < files.length; f++) {
    let file = files[f];
    if (file.substring(file.length-5) !== ".json") continue;
    let contents = JSON.parse(fs.readFileSync("./data/items/" + file, 'utf8'));
    let aliases = {};
    for (let i in contents) {
        let c = contents[i];
        if (typeof c === "string") {
            aliases[i] = c;
            continue;
        }
        let itemid = c.type.toLowerCase() + c.id;
        if (i in Items) throw new Error("Duplicate item ID " + i + " in " + file);
        Items[i] = c;
        Items[itemid] = c;
    }
    for (let i in aliases) {
        let a = aliases[i];
        if (!Items[toId(a)]) throw new Error("Item alias for nonexistent item: " + a)
        Items[i] = Items[toId(a)];
    }
}
module.exports = {}