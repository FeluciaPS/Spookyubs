class Room {
    constructor(id) {
        this.users = [];
        this.id = id
    }
    
    send(message) {
        if (typeof message === typeof {}) {
            for (let i in message) {
                Send(this.name, message[i])
            }
            return;
        }
        Send(this.name, message);
    }
    
    can(user, rank) {
        
    }
}

exports.add = function(id) {
    this[id] = new Room(id);
}