class Player {
    constructor(name, num, entity) {
        if (name.startsWith("|")) {
            this.load(name);
            this.num = "P" + num;
            return; 
        }
        this.entity = Players.get(toId(name));
        this.name = this.entity.name;
        let stats = {}
        if (!this.entity) stats = Utils.allZeros;
        else stats = this.entity.getStats();
        this.maxhp = stats.hp;
        this.curhp = stats.hp;
        this.atk = stats.atk;
        this.mag = stats.mag;
        this.pe = stats.pe;
        this.me = stats.me;
        this.mp = stats.mp;
        this.num = "P" + num;
        this.pos = [0, 0];
        this.team = false;
        this.monster = false;
        //this.save();
    }
    
    save() {
        let ret = "\n|false|" + this.entity.name;
        ret += `\n|${this.entity.class}|${this.entity.weapon}|${this.entity.getLevels()}\n`;
        ret += `|${this.entity.active ? Items[this.entity.active].id : ""}|${this.entity.passive ? Items[this.entity.passive].id : ""}\n`;
        ret += `|${this.curhp}`;
        ret += `|\n` // This whill be MS data later
        ret += `|${this.pos.join(',')}|${this.team ? this.team : ""}\n`;
        return ret;
    }
    
    load(data) {
        let dt = data.split("|");
        this.entity = Players.get(toId(dt[2]));
        this.name = this.entity.name;
        this.entity.game = this;
        let stats = this.entity.getStats();
        this.maxhp = stats.hp;
        console.log(dt[9]);
        this.curhp = parseInt(dt[8]);
        this.atk = stats.atk;
        this.mag = stats.mag;
        this.pe = stats.pe;
        this.me = stats.me;
        this.mp = stats.mp;
        this.pos = dt[10].trim().split(",");
        this.team = false;
    }
}

// ["nom","clvl","blvl","maxHP","curHP","attack","magic","md","me","pd","pe","mov","location","party","weap","cls","team"]

class Monster {
    constructor(name, num, entity) {
        if (name.startsWith("|")) {
            this.load(name);
            return; 
        }
        this.name = name;
        this.entity = Monsters.get(toId(name));
        let stats = {}
        if (!this.entity) stats = Utils.allZeros;
        else stats = this.entity.getStats();
        this.maxhp = stats.hp;
        this.curhp = stats.hp;
        this.atk = stats.atk;
        this.mag = stats.mag;
        this.pe = stats.pe;
        this.me = stats.me;
        this.mp = stats.mp;
        this.num = "M" + num;
        this.pos = [0, 0];
        this.team = false;
        this.monster = true;
        //this.save();
    }
    
    save() {
        let ret = "\n|" + this.name;
        ret += `\n|${this.entity.name}|${this.level}\n`;
        ret += `|${this.curhp}`;
        ret += `|\n` // This whill be MS data later
        ret += `|${this.pos.join(',')}|true\n`;
        return ret;
    }
}

class EntityList {
    constructor(cap = 16) {
        if (typeof cap === 'string') {
            return this.load(cap);
        }
        this.cap = cap;
        this.playerlist = [];
        this.monsterlist = [];
        this.otherlist = []; // Futureproofing, not used
    }
    
    Count() {
        return this.playerlist.length + this.monsterlist.length + this.otherlist.length;
    }
    
    addp(name) {
        if (this.Count() >= this.cap) return "capped";
        this.playerlist.push(new Player(name, this.playerlist.length + 1));
        return true;
    }
    
    addm(monster) {
        if (this.Count() >= this.cap) return "capped";
        this.monsterlist.push(new Monster(monster, this.monsterlist.length + 1));
        return true;
    }
    
    getPlayer(p) {
        p = toId(p);
        for (let i of this.playerlist) {
            if (i.entity.id === p) return i;
        }
        p = p.toUpperCase();
        for (let i of this.playerlist) {
            if (i.num === p) return i;
        }
        return this.getMonster(p);
    }
    
    getMonster(m) {
        m = toId(m);
        for (let i of this.monsterlist) {
            if (toId(i.name) === m) return i;
        }
        m = m.toUpperCase();
        for (let i of this.monsterlist) {
            if (i.num === m) return i;
        }
        return false;
    }
    
    getPos() {
        let pos = {};
        for (let i of this.playerlist) {
            if (!(i.pos[0] in pos)) pos[i.pos[0]] = {};
            pos[i.pos[0]][i.pos[1]] = i.num;
        }
        for (let i of this.monsterlist) {
            if (!(i.pos[0] in pos)) pos[i.pos[0]] = {};
            pos[i.pos[0]][i.pos[1]] = i.num;
        }
        return pos;
    }
    
    save() {
        let ret = "--";
        for (let i of this.playerlist) {
            ret += i.save() + "-";
        }
        for (let i of this.monsterlist) {
            ret += i.save() + "-";
        }
        if (ret.length < 3) ret += "-";
        ret += "-";
        return ret;
    }
    
    load(data) {
        let dt = data.split("-");
        let cap = 16;
        this.playerlist = [];
        this.monsterlist = [];
        this.otherlist = []; // Futureproofing, not used
        for (let i in dt) {
            let entity = dt[i].trim();
            if (entity.split("|")[1] === "true") this.addm(entity);
            else this.addp(entity)
        }
    }
}

class Game {
    constructor(host, squad, elo = false, raid = false) {
        if (typeof host === "string"){
            return this.load(host);
        }
        this.host = host;
        host.host = this;
        
        this.squad = squad;
        this.players = 0;
        this.monsters = 0;
        this.entities = new EntityList();
        if (raid) {
            this.entities.cap = 32;
            this.entities.addm("placeholder");
        }
        this.map = false;
        this.opl = [];
        this.to = {}
        this.map = false;
        this.elo = elo;
        this.raid = raid;
        this.save();
    }
    
    addp(user) {
        this.entities.addp(user);
        user.game = this;
        this.save();
    }
    
    addm(monster) {
        this.entities.addm(monster);
        this.save();
    }
    
    getPlayer(p) {
        return this.entities.getPlayer(p);
    }
    
    getMonster(m) {
        return this.entities.getMonster(m);
    }
    
    save() {
        let ret = `|${this.squad}|${this.host.id}|${this.elo}|${this.raid}\n`;
        ret += this.entities.save();
        ret += `\n|${this.opl.join(',')}`; // continuing tomorrow
        ret += `\n|${this.map}`;
        FS.writeFileSync('./data/squad/' + this.squad + '.gm', ret);
    }
    
    load(data) {
        let dt = data.split('|');
        this.squad = dt[1];
        this.host = Players.get(dt[2]);
        this.elo = (dt[3] === 'true');
        this.raid = (dt[4] === 'true');
        this.host.host = this;
        this.entities = new EntityList(data.split("--")[1].trim());
        this.opl = data.split('--')[2].split('|')[1].split(',');
        this.map = data.split('--')[2].split('|')[2].trim();
    }
    buildMap(css = false) {
        let terrain = {
            "normal": "A9F5A9",
            "stop": "a9a9a9"
        }
        let tiles = Object.keys(terrain);
        let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let pos = this.entities.getPos();
        if (!css) {
            let ret = `<table align="center" style="border-spacing:1px; background-color:black; color:black">`;
            //let map = Maps.get(this.map);
            let map = FS.readFileSync(`./data/maps/${this.map}.map`, 'utf8');
            let rows = map.split("\n");
            for (let r in rows) {
                let row = rows[r].trim();
                if (r === "0") {
                    ret += `<tr><td style="background:#EEEEEE" width="20px" height="20px"; align="center"><b>  </b></td>`;
                    for (let c in row.split(",")) {
                        ret += `<td style="background:#EEEEEE" width="20px" height="20px"; align="center"><b>${Number(c)+1}</b></td>`;
                    }
                    ret += `</tr>`;
                }
                ret += `<tr>`;
                let cols = row.split(',');
                for (let c in cols) {
                    let col = cols[c];
                    if (c === "0") {
                        ret += `<td style="background:#EEEEEE" width="20px" height="20px"; align="center"><b>${letters.charAt(r)}</b></td>`;
                    }
                    let p = pos[r] ? (pos[r][c] ? pos[r][c] : "") : "";
                    ret += `<td style=background-color:#${terrain[tiles[col]]}; width="20px" height="20px"; align="center"><b style="color:black">${p}</b></td>`
                }
                ret += `</tr>`;
            }
            ret += `</table>`;
            return ret;
        }
        else {
            let ret = `<table class="bdmap" align="center">`;
            let map = FS.readFileSync(`./data/maps/${this.map}.map`, 'utf8');
            let rows = map.split("\n");
            for (let r in rows) {
                let row = rows[r].trim();
                if (r === "0") {
                    ret += `<tr><td class="bdheader"><b>  </b></td>`;
                    for (let c in row.split(",")) {
                        ret += `<td class="bdheader"><b>${Number(c)+1}</b></td>`;
                    }
                    ret += `</tr>`;
                }
                ret += `<tr>`;
                let cols = row.split(',');
                for (let c in cols) {
                    let col = cols[c];
                    if (c === "0") {
                        ret += `<td class="bdheader"><b>${letters.charAt(r)}</b></td>`;
                    }
                    let p = pos[r] ? (pos[r][c] ? pos[r][c] : "") : "";
                    ret += `<td class="bd${tiles[col]}"><b style="color:black">${p}</b></td>`
                }
                ret += `</tr>`;
            }
            ret += `</table>`;
            return ret;
        }
        
    }
    
    buildPL(css = false) {
        let ret = `<table align="center" style="background-color:black; border-spacing:2px; color:black">`;
        let items = this.entities.Count() !== 2;
        ret += `<tr style="background:#A9A9F5;height:22px"><th style="width:22px">#</th><th>Name</th>${items ? '<th style="width:22px">AC</th><th style="width:22px">PA</th>' : ""}<th>Class/Weapon</th><th>HP</th><th style="width:22px">A</th><th style="width:22px">M</th><th style="width:22px">PE</th><th style="width:22px">ME</th><th style="width:22px">MP</th></tr>`;
        
        for (let p of this.entities.playerlist) {
            ret += `<tr style="background:#A9A9F5;height:22px"><th>${p.num}</th><th>${p.name}</th>`;
            if (items) ret += `<th>${p.entity.active ? Items[p.entity.active].id : "-"}</th><th>${p.entity.passive ? Items[p.entity.passive].id : "-"}</th>`;
            ret += `<th>${Classes[p.entity.class].nom}(${p.entity.levels[p.entity.class]})/${Weapons[p.entity.weapon].nom}(${p.entity.levels[p.entity.branch]})</th>`;
            ret += `<th>${p.curhp}/${p.maxhp}</th><th>${p.atk}</th><th>${p.mag}</th><th>${p.pe}</th><th>${p.me}</th><th>${p.mp}</th></tr>`
        }
        ret += `<tr style="background:#A9A9F5;min-height:22px"><th colspan="11">Turn Order: UnleashOurPassion, Gimm1ck, You suck, I don't suck</th></tr>`
        ret += `</table>`;
        return ret;
    }
    // players,monsters,mLevel,gchat,entities,kills,turnorder,mapid,map,pl,ugm,closed,mode,startTime,lastCmd,monstername,namedtiles,pveformfilled,random,modkilled,surv,turncount,voicelist,cuttime,wgopointsawarded,notes,dead,opl,avglvl,locked,vanilla

}

Game.prototype.toString = function() {
	return this.squad + " hosted by " + this.host;
}

module.exports = game = {};
game.add = function(host, elo = false, raid = false) {
    let id = toId(host);
    let hostObj = Players.get(id);
    let squad = this.squadManager.Next();
    if (squad === -1) return false;
    this[squad] = new Game(hostObj, squad, elo, raid);
    return squad;
}

game.load = function(data) {
    let squad = data.split('|')[1];
    this[squad] = new Game(data);
    return squad;
}

class SquadManager {
    constructor() {
        let squads = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
        this.squads = {}
        for (let i = 0; i < squads.length; i++) {
            this.squads[squads[i]] = false;
        }
        this.filename = './data/squad/squadmanager';
        this.load();
    }
    
    load() {
        let file = require('fs').readFileSync(this.filename, 'utf8').split(',');
        console.log(file);
        for (let i = 0; i < file.length; i++) {
            if(!file[i]) continue;
            this.squads[file[i]] = true;
            game.load(FS.readFileSync('./data/squad/' +file[i] + '.gm', 'utf8'));
        }
    }
    
    save() {
        let a = [];
        for (let i in this.squads) {
            if (this.squads[i]) a.push(i);
        }
        require('fs').writeFile(this.filename, a.join(','), () => {});
    }
    
    Next() {
        let squad = -1;
        for (let i in this.squads) {
            if (!this.squads[i]) {
                squad = i;
                break;
            }
        }
        this.squads[squad] = true;
        this.save();
        return squad;
    }
    
    dehost(squad) {
        this.squads[squad] = false;
        this.save();
    }
}
game.squadManager = new SquadManager();

game.remove = function(squad) {
    this.squadManager.dehost(squad);
    this[squad].host.host = false;
    delete this[squad];
}