class Tournament {
    constructor(room, type) {
        logger.emit('log', 'Tour created in ' + room);
        this.room = room;
        this.official = type === 'official' || type === 'o';
        this.chill = type === 'chill';
        let tourcheck = room.id + (this.official ? "-o" : "");
        
        if (type === "late") return;
        if (Config.tours[tourcheck]) {
            let t = Config.tours[tourcheck];
            this.room.send([`/tour autostart ${t[0]}`, `/tour autodq ${t[1]}`]);
        }
        else if (Config.tours[room.id]) {
            let t = Config.tours[room.id];
            this.room.send([`/tour autostart ${t[0]}`, `/tour autodq ${t[1]}`]);
        }
        else {
            this.room.send([`/tour autostart 2`, `/tour autodq 2`]);
        }
    }
    
    end() {
        logger.emit('log', 'Tour ended in ' + this.room.id);
        if (this.chill) this.room.send('/modchat ac');
        if (this.room.id === '1v1typechallenge') this.room.send("Tournament ended");
    }
}

Tournament.prototype.toString = function() {
    return "Tournament in " + this.room.name;
}
module.exports = Tournament;