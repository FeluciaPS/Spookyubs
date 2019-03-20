class User {
    constructor(name) {
        this.rooms = {};
        this.name = name.substring(1);
        this.id = toId(name);
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
    
    join(room, name) {
        this.rooms[room] = name.charAt(0);
        Rooms[room].users[this.id] = this;
    }
    
    leave(room) {
        delete this.rooms[room];
        delete Rooms[room].users[this.id];
        if (!Object.keys(this.rooms).length) bot.emit('dereg', 'user', this.id);
    }
    
    can(room, rank) {
        if (rank === "all") return Config.devs.indexOf(this.id) !== -1;
        return Ranks[this.rooms[room]] <= Ranks[rank];
    }
}

User.prototype.toString = function userToString() {
	return this.userid;
}

exports.add = function(name) {
    let id = toId(name);
    this[id] = new User(name);
}