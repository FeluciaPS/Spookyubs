class User {
    constructor(name) {
        this.rooms = {};
        this.name = name.substring(1);
        this.id = toId(name);
        this.checkmail();
    }
    
    send(message) {
        if (typeof message === typeof {}) {
            for (let i in message) {
                Sendpm(this.name, message[i])
            }
            return;
        }
        Sendpm(this.name, message);
    }
    
    checkmail() {
        let self = this;
        FS.readFile(`mail/${self.id}.json`, (err, data) => {
            let maildata = [];
            if (err) { return; }
            
            try { 
                maildata = JSON.parse(data);
            }
            catch (e) {
                maildata = ["[mailerror] Your mail data crashed. Some mail may have gotten lost."];
                FS.unlinkSync(`mail/${self.id}.json`);
            }
            if (!maildata.length) return;
            while (maildata.length) {
                let mail = maildata.shift();
                self.send(mail);
            }
            FS.writeFile(`mail/${self.id}.json`, JSON.stringify(maildata, null, 4), (err) => {
                if (err) throw err;
            });
        });
    }
    
    join(room, name) {
        this.last = false;
        this.rooms[room] = name.charAt(0);
        Rooms[room].users[this.id] = this;
    }
    
    leave(room) {
        delete this.rooms[room];
        delete Rooms[room].users[this.id];
        if (!Object.keys(this.rooms).length && this != Users.self) bot.emit('dereg', 'user', this.id);
    }
    
    rename(name) {
        this.id = toId(name);
        this.name = name.substring(1);
        this.checkmail();
    }
    
    can(room, rank) {
        if (Config.devs.indexOf(this.id) !== -1) return true;
        if (rank === "all") return false;
        if (this.id === toId(Config.username)) return false;
        if (!room) return false;
        if (rank === "apph") {
            if (Players.get(this.id) && Players.get(this.id).apphost) return true;
            rank = "+";
        }
        if (room.id) room = room.id;
        return Ranks[this.rooms[room]] <= Ranks[rank];
    }
}

User.prototype.toString = function() {
	return this.id;
}

exports.add = function(name) {
    let id = toId(name);
    this[id] = new User(name);
}

exports[toId(Config.username)] = new User(" " + Config.username);
exports.self = exports[toId(Config.username)]