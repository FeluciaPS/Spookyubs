bot.on('challstr', function(parts) {
    require("./login.js")(parts[2], parts[3])
});

bot.on('c', (parts) => {
    if (toId(parts[3]) !== "unleashourpassion") return;
    if (parts[4].startsWith('uwuop.reload')) {
        logger.emit('error', 'this still works')
        let room = Utils.getRoom(parts[0]);
        bot.emit('reload', parts[4].split(" ")[1], room);
    }
    if(parts[4].startsWith('uwuop.fakeerror')) {
        logger.emit('error', "Fake error");
    }
});

module.exports = {};