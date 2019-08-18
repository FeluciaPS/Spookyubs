let compobj = function(obj) {
    let a = Object.keys(obj);
    let b = Object.values(obj);
    if (a.length === 0) return "";
    let ret = []
    for (let i = 0; i < a.length; i++) {
        ret.push(a[i] + ',' + b[i]);
    }
    return ret.join(',');
}

let uncompobj = function(data) {
    if (!data.trim()) return {};
    let obj = {};
    let dt = data.split(',');
    for (let i = 0; i < dt.length; i++) {
        if (i % 2 === 1) continue;
        if (!isNaN(parseInt(dt[i+1]))) obj[dt[i]] = parseInt(dt[i+1]);
        else obj[dt[i]] = dt[i+1];
    }
    return obj;
}

class Player {
    constructor (name, Class, Weapon) {
        console.log(name);
        if (name.startsWith("|")) {
            this.load(name);
            return;
        }
        
        this.name = name;
        this.id = toId(name);
        this.filename = `./data/players/${this.id}.pl`;
        this.branch = Weapon.branch;
        this.weapon = toId(Weapon.nom);
        this.class = toId(Class.nom);
        this.passive = false;
        this.active = false;
        this.xp = 0;
        this.totalxp = 0;
        this.gold = 0;
       
        this.inventory = {
            gems: {},
            itemnames: [],
            itemids: []
        }
        
        this.levels = {};
        this.resetLevels();
        this.apphost = false
        this.save();
    }
    
    resetLevels() {
        for (let weap in Weapons) {
            let Weapon = Weapons[weap]
            if (!Weapon.branch) continue;
            this.levels[Weapon.branch] = 1
        }
        
        for (let cls in Classes) {
            let Class = Classes[cls];
            let nom = Class.nom;
            if (!nom) continue;
            this.levels[toId(nom)] = 1
        }
    }
    
    save() {
        let ret = "";
        
        ret += `|${this.id}\n`;
        ret += `|${this.name}\n`;
        ret += `|${this.branch}|${this.weapon}|${this.class}\n`;
        ret += `|${this.passive}|${this.active} // Passive and Active item\n`;
        ret += `|${this.xp}|${this.totalxp} // XP\n`;
        ret += `|${this.gold} // Gold\n`;
        ret += `|${compobj(this.inventory.gems)} // Gems\n`;
        ret += `|${this.inventory.itemnames.join(",")} // Items (names)\n`;
        ret += `|${this.inventory.itemids.join(",")} // Items (ids)\n`;
        ret += `|${compobj(this.levels)}\n`;
        ret += `|${this.apphost ? 1 : 0} // apphost`
        
        FS.writeFileSync(this.filename, ret);
    }
    
    load(data) {
        let parts = data.split("|");
        
        this.id = parts[1].trim();
        this.name = parts[2].trim();
        this.branch = parts[3].trim();
        this.weapon = parts[4].trim();
        this.class = parts[5].trim();
        this.passive = parts[6].trim();
        this.active = parts[7].split("//")[0].trim()
        
        if (this.passive == "false") this.passive = false;
        if (this.active == "false") this.active = false;
        
        this.xp = parseInt(parts[8].trim());
        this.totalxp = parseInt(parts[9].split("//")[0]);
        this.gold = parseInt(parts[10].split("//")[0]);
        this.inventory = {
            gems: uncompobj(parts[11].split("//")[0].trim()),
            itemnames: parts[12].split("//")[0].trim() ? parts[12].split("//")[0].trim().split(',') : [],
            itemids: parts[13].split("//")[0].trim() ? parts[13].split("//")[0].trim().split(',') : [],
        }
        this.levels = uncompobj(parts[14].trim());
        this.filename = `./data/players/${this.id}.pl`;
        this.apphost = parts[15].split("//")[0].trim();
    }
    
    getStat(stat, includeitems = true) { 
        // this function is seriously lacking in quality but right now I just can't be arsed
        // If someone sees this and wants to compress it, feel free to do so. 
        // Just make sure it still works the same
        if (!stat) return false;
        let stats = ["hp","atk","mag","md","me","pd","pe","mp"];
        stat = toId(stat);
        if (stats.indexOf(stat) === -1) return false;
        console.log(stat);
        let ret = 0;
        if (includeitems) {
            if (this.passive && Items[this.passive].boost[stat]) ret += Items[this.passive].boost[stat];
            if (this.active && Items[this.active].boost[stat]) ret += Items[this.active].boost[stat];
        }
        
        let clvl = this.levels[this.class];
        let blvl = this.levels[this.branch];
        if (stat === 'pe') {
            ret = ret * 10;
            stat = 'pd';
            ret += Utils.statCalc(Weapons[this.weapon].stats[stat], blvl);
            ret += Utils.statCalc(Classes[this.class].stats[stat], clvl);
            if (includeitems) {
                if (this.passive && Items[this.passive].boost[stat]) ret += Items[this.passive].boost[stat];
                if (this.active && Items[this.active].boost[stat]) ret += Items[this.active].boost[stat];
            }
            return Math.floor(ret / 10);
        }
        if (stat === 'me') {
            ret = ret * 10;
            stat = 'md';
            ret += Utils.statCalc(Weapons[this.weapon].stats[stat], blvl);
            ret += Utils.statCalc(Classes[this.class].stats[stat], clvl);
            if (includeitems) {
                if (this.passive && Items[this.passive].boost[stat]) ret += Items[this.passive].boost[stat];
                if (this.active && Items[this.active].boost[stat]) ret += Items[this.active].boost[stat];
            }
            return Math.floor(ret / 10);
        }
        
        ret += Utils.statCalc(Weapons[this.weapon].stats[stat], blvl);
        ret += Utils.statCalc(Classes[this.class].stats[stat], clvl);
        return ret;
    }
    
    getStats(includeitems = true) {
        let ret = {};
        let stats = ["hp","atk","mag","pd","pe","me","mp"];
        for (let i = 0; i < stats.length; i++) {
            ret[stats[i]] = this.getStat(stats[i], includeitems);
        }
        return ret;
    }

    getLevels() {
        return [this.levels[this.class], this.levels[this.branch]];
    }
    
    appHost(deapphost = false) {
        this.apphost = !deapphost
        this.save();
    }
    
    buildVS(self = false) {
        let ret = `<b>${this.name}:</b><br>`;
        if (self) ret += `<b>XP:</b> ${this.xp}<br>`;
        ret += `<b>HP:</b> ${this.getStat("hp")}<br>`;
        ret += `<b>Active/Passive Item:</b><br>${this.active ? Items[this.active].nom : "-"}/${this.passive ? Items[this.passive].nom : "-"}<br>`;
        ret += `<b>Class/Weapon:</b><br>${Classes[this.class].nom}(${this.levels[this.class]})/${Weapons[this.weapon].nom}(${this.levels[this.branch]})<br>`;
        ret += `<b>Attack/Magic:</b> ${this.getStat("atk")}/${this.getStat("mag")}<br>`;
        ret += `<b>Evasion (P/M):</b> ${this.getStat("pe")}/${this.getStat("me")}<br>`;
        ret += `<b>Movement:</b> ${this.getStat("mp")}`;
        return ret;
    }
    
    buildVI(self = false) {
        let ret = `Item stats for player <b>${this.name}:</b><br><br>`;
        ret += `<b>Gold:</b> ${this.gold}<br>`;
        ret += `<details><summary><b>Gems</b></summary>`;
        for (let i in this.inventory.gems) {
            let n = this.inventory.gems[i];
            ret += `${i.capitalize()}: ${n}<br>`
        }
        ret += `</details><br>`;
        ret += `<b>Current Active item</b>: ${this.active ? Items[this.active].nom : "-"}<br>`;
        ret += `<b>Current Passive item</b>: ${this.passive ? Items[this.passive].nom : "-"}<br><br>`;
        ret += `<details><summary><b>`
        if (self) ret += `List of items you own`;
        else ret += `List of items ${this.name} owns`;
        ret += `</b></summary>`;
        let b = [];
        for (let i in this.inventory.itemnames) {
            b.push(Items[this.inventory.itemnames[i]].nom)
        }
        if (b.length) ret += b.join("<br>");
        ret += "</details>";
        
        // There's supposed to be a "list of items that you can afford" that follows here but I'M CRYING INTERNALLY so that's not happening right now
        return ret;
    }
    
    buildVL(self = false) {
        let ret = "";
        if (self) ret += `<b>XP:</b> ${this.xp}<hr>`;
        ret += `<details><summary><b>`;
        if (self) ret += `Your Class levels are`;
        else ret += `${this.name}'s Class levels are`;
        ret += `</b></summary><hr>`;
        let temp = [];
        for (let i in Classes) {
            if (!this.levels[i] || typeof this.levels[i] !== 'number') continue;
            temp.push(`<b>${Classes[i].nom}</b>: ${this.levels[i]}`);
        }
        ret += temp.join('<br>');
        ret += `</details><br>`;
        ret += `<details><summary><b>`;
        if (self) ret += `Your Branch levels are`;
        else ret += `${this.name}'s Branch levels are`;
        ret += `</b></summary><hr>`;
        temp = [];
        for (let i in Branches) {
            temp.push(`<b>${i.capitalize()}</b>: ${this.levels[i]}`);
        }
        ret += temp.join('<br>');
        ret += `</details>`;
        return ret;
        
    }
    
    sc(cls) {
        if (typeof cls === "string") {
            cls = toId(cls);
            cls = Classes[cls];
            if (!cls) return "This class does not exist. Available classes: " + Classes;
        }
        this.class = toId(cls.nom);
        this.save();
        return "Successfully changed your class to " + cls.nom;
    } 
    
    sco(cls, weap) {
        if (typeof cls === "string") {
            cls = toId(cls);
            cls = Classes[cls];
            if (!cls) return "This class does not exist. Available classes: " + Classes;
        }
        if (typeof weap === "string") {
            weap = toId(weap);
            weap = Weapons[weap];
            if (!weap) return "This weapon does not exist. Available weapons: " + Weapons;
        }
        this.class = toId(cls.nom);
        this.weapon = toId(weap.nom);
        this.branch = weap.branch;
        this.save();
        return "Successfully changed to " + cls.nom + " and " + weap.nom;
    } 
    
    sw(weap) {
        if (typeof weap === "string") {
            weap = toId(weap);
            weap = Weapons[weap];
            if (!weap) return "This weapon does not exist. Available weapons: " + Weapons;
        }
        this.weapon = toId(weap.nom);
        this.branch = weap.branch;
        this.save();
        return "Successfully changed your weapon to " + weap.nom;
    } 
}

let plobj = {};

plobj.get = function(name) {
    let id = toId(name);
    if (id === 'get' || id === 'add') return false;
    if (plobj[id]) return plobj[id];
    if (FS.existsSync(`./data/players/${id}.pl`)) {
        plobj[id] = new Player(FS.readFileSync(`./data/players/${id}.pl`, 'utf8'));
        return plobj[id];
    }
    return false;
}

plobj.add = function(name, cls, weap) {
    let id = toId(name);
    if (id === 'get' || id === 'add') return "illegal";
    if (name.length > 19) return "toolong";
    plobj[name] = new Player(name, cls, weap);
    return plobj[name];
}

module.exports = plobj