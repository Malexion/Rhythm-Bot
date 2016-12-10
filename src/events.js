const __ = require('iterate-js');

module.exports = function(bot) {
    bot.speakers = [];

    var parseMsg = (msg) => {
        msg.meta = msg.content.split(' ');
        var x = msg.meta.slice();
        msg.cmd = x.shift().replace(bot.config.command.symbol, '');
        msg.details = x.join(' ');
        return msg;
    };

    __.all({
        message: msg => {
            if(bot.config.discord.log && msg.author.id != bot.client.user.id && msg.content[0] == bot.config.command.symbol)
                console.log('{0}{1}{2} : {3}'.format(
                    msg.guild ? '{0} '.format(msg.guild.name) : '', 
                    msg.channel.name ? '#{0} @ '.format(msg.channel.name) : 'PM @ ', 
                    msg.author.username, 
                    msg.content
                ));
            if(msg.content && msg.content[0] == bot.config.command.symbol) {
                try {
                    var data = parseMsg(msg),
                        cmd = bot.commands[data.cmd];
                    if(__.is.function(cmd))
                        cmd(data);
                } catch(e) {
                    console.log(e);
                }
            }
            try {
                bot.manager.clean();
            } catch(e) {
                console.log(e);
            }
        },

        ready: () => {
            if(bot.online)
                console.log('Reconnected.');
            else
                console.log('Rhythm Bot Online.');
            bot.online = true;
            bot.manager.clean();
        },

        reconnecting: () => {
            console.log('Reconnecting...');
        },

        disconnect: () => {
            console.log('Disconnected.');
        },

        error: error => {
            console.log(error);
        },

        guildMemberUpdate: (old, member) => {
            if(member.user.username == bot.client.user.username && member.mute && !old.mute) {
                member.setMute(false);
                console.log('Bot muted....unmuteing');
            }
        },

        guildMemberSpeaking: (member, isSpeaking) => {
            if(isSpeaking)
                bot.speakers.push(member.id);
            else {
                var idx = bot.speakers.indexOf(member.id);
                if(idx > -1)
                    bot.speakers.splice(idx, 1);
            }

            if(bot.config.auto.deafen) {
                var track = bot.queue.first;
                if(track && track.dispatcher) {
                    if(bot.speakers.length > 0)
                        track.dispatcher.setVolume(0.5);
                    else
                        track.dispatcher.setVolume(bot.config.stream.volume);
                }
            }
        }

    }, (func, name) => { bot.client.on(name, func); });
};