
const __ = require('iterate-js');
const youtube = require('ytdl-core');
const spotify = require('../services/spotify.js');

const infohandlers = {

    spotify: function(search, cb) {
        var uri = search.split(':')[1];
        spotify.getInfo(uri, cb);
    },

    youtube: function(search, cb) {
        var url = search.contains('://') ? search : 'https://www.youtube.com/watch?v=' + search;
        youtube.getInfo(url, cb);
    }

};

const handlers = {

    spotify: function(bot, msg, track) {
        var uri = track.search.split(':')[1];
        track.dispatcher = msg.guild.voiceConnection.playStream(spotify(bot, uri), bot.config.stream);
    },

    youtube: function(bot, msg, track) {
        var url = track.search.contains('://') ? track.search : 'https://www.youtube.com/watch?v=' + track.search;
        track.dispatcher = msg.guild.voiceConnection.playStream(youtube(url, { audioonly: true }), bot.config.stream);
    }

};

module.exports = function(bot) {
    bot.jukebox = {
        play: function(track, msg) {
            if(bot.config.queue.announce) {
                if(track.title)
                    msg.channel.sendMessage(`:musical_note: Now playing: "${track.title}", Requested by: ${track.requestor}`);
            }
            track.playing = true;
            var handler = handlers[track.type];
            if(handler) {
                handler(bot, msg, track);
                if(track.dispatcher) {
                    track.dispatcher.on('end', () => {
                        if(track.playing) {
                            track.playing = false;
                            var lasttrack = bot.queue.dequeue();
                            if(bot.config.queue.repeat)
                                bot.queue.enqueue(lasttrack);
                            msg.trans = true;
                            bot.commands.play(msg);
                            setTimeout(() => {
                                track.dispatcher = null;
                            }, 100);
                        }
                    });
                    track.dispatcher.on('error', (err) => {
                        bot.commands.skip(msg);
                        return msg.channel.sendMessage('error: ' + err);
                    });
                }
            } else
                msg.channel.sendMessage(`Improper track type: "${track.type}"`);
        },
        info: function(track, msg, cb) {
            var handler = infohandlers[track.type];
            if(handler)
                handler(track.search, cb);
            else
                msg.channel.sendMessage(`Improper track type: "${track.type}"`);
        }
    };
};