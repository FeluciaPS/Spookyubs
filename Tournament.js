class Tournament {
    constructor(room, type) {
        this.room = room;
        this.official = type === 'official' || type === 'o';
        this.chill = type === 'chill';
        let tourcheck = room.id + ((this.official || type === "monopoke") ? "-o" : "");
        
        if (type === "late") return;
        if (Config.tours[tourcheck]) {
            let t = Config.tours[tourcheck];
            this.room.send(`/tour autostart ${t[0]}`);
            this.room.send(`/tour autodq ${t[1]}`);
            if (t[2]) this.room.send('/tour scouting disallow');
        }
        else if (Config.tours[room.id]) {
            let t = Config.tours[room.id];
            this.room.send(`/tour autostart ${t[0]}`);
            this.room.send(`/tour autodq ${t[1]}`);
            if (t[2]) this.room.send('/tour scouting disallow');
        }
        else {
            this.room.send(`/tour autostart 2`);
            this.room.send(`/tour autodq 2`);
        }
        if (this.official) room.send('.official');
        if (this.chill) room.send('/modchat +');
    }
    
    end() {
        if (this.chill) this.room.send('/modchat ac');
    }
}

Tournament.prototype.toString = function() {
    return "Tournament in " + this.room.name;
}
module.exports = Tournament;