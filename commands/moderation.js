module.exports = {
    apph: 'apphost',
    apphost: function(room, user, args) {
        //if (!room.is('bd')) return;
        if (!user.can('battledome', '%')) return;
        if (!args[0]) return room.send("Usage: ``%apphost [username]``");
        let id = toId(args[0]);
        let player = Players.get(id)
        if (!player) return room.send("This user does not have a character.");
        player.appHost();
        return room.send("User promoted to apphost.");
    }
}