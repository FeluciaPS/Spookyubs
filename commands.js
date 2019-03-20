module.exports = {
    '1v1': function(room, user, args) {
        if (!user.can(room, '%')) return;
        if (args) {
            if (args[0].startsWith("rr")) {
                let count = parseInt(args[0].substring(2));
                if (count) Send(room, "/tour create 1v1, rr,, " + count);
                else Send(room, "/tour create 1v1, rr");
            }
            else if (args[0].startsWith("e")){
                let count = parseInt(args[0].substring(1));
                if (count) Send(room, "/tour create 1v1, elim,, " + count);
                else Send(room, "/tour create 1v1, elim");
            }
            else {
                Send(room, "/tour create 1v1, elim")
            }
        }
        else Send(room, "/tour create 1v1, elim");
    },
    reload: function(room, user, args) {
        if (!user.can(room, 'all')) return;
        bot.emit('reload', args[0], room);
    },
    eval: function(room, user, args, val){
        Send(room, eval(val));
    },
    settype: 'st',
    st: function(room, user, args) {
        if (!user.can(room, '%')) return;
        let type = args[0];
        if (!type) return;
        
        if (type === "rr") {
            Send(room, "/tour settype rr");
        }
        if (type === "rr2") {
            Send(room, "/tour settype rr,, 2");
        }
        if (type === "de" || type === "e2") {
            Send(room, "/tour settype elim,, 2");
        }
        if (type === "e" || type === "elim" || type === "se") {
            Send(room, "/tour settype elim");
        }
    }
};