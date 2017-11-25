
const __ = require('iterate-js');
const moment = require('moment');
const helpText = require('../helptext.js');
const songtypes = [
    //'spotify',
    'youtube'
];

module.exports = function(bot) {
    bot.commands = {

        help: msg => {
            msg.channel.sendMessage(helpText.format(bot.config.command.symbol));
        },

        ping: msg => {
            var phrases = [ 
                `Can't stop won't stop!`, 
                `:ping_pong: Pong Bitch!` 
            ];
            var random = (array) => {
                return array[Math.floor(Math.random() * array.length)];
            };
            if(msg.guild)
                phrases = phrases.concat(msg.guild.emojis.array());
            msg.channel.sendMessage(random(phrases));
        },

        join: msg => {
            return new Promise((resolve, reject) => {
                var voicechannel = msg.member.voiceChannel;
                if(voicechannel && voicechannel.type == 'voice') {
                    voicechannel.join()
                        .then(connection => {
                            bot.speakers = [];
                            if(bot.config.auto.play)
                                bot.commands.play(msg);
                            resolve(connection);
                            msg.channel.sendMessage(`:speaking_head: Joined channel: ${voicechannel.name}`);
                        }).catch(err => reject(err));
                } else
                    return msg.channel.sendMessage("I couldn't connect to your voice channel.");
            });
        },

        leave: msg => {
            bot.commands.stop();
            bot.client.voiceConnections.every(connection => {
                connection.disconnect();
                msg.channel.sendMessage(`:mute: Disconnecting from channel: ${connection.channel.name}`); 
            });
            
        },

        play: msg => {
            if(bot.queue.count == 0)
                return msg.channel.sendMessage(msg.trans ? 'Add some songs to the queue first' : 'No remaining songs in the queue');
            if(!msg.guild.voiceConnection)
                return bot.commands.join(msg).then(() => bot.commands.play(msg));
            if(bot.queue.first.playing)
                return msg.channel.sendMessage('Already playing a song');
            
            bot.paused = false;
            bot.jukebox.play(bot.queue.first, msg);
        },

        pause: msg => {
            var track = bot.queue.first;
            if(track && track.dispatcher) {
                bot.queue.first.paused = true;
                track.dispatcher.pause();
                msg.channel.sendMessage(`:pause_button: "${track.title}" paused`);
            }
        },

        resume: msg => {
            var track = bot.queue.first;
            if(track && track.dispatcher) {
                bot.queue.first.paused = false;
                track.dispatcher.resume();
                msg.channel.sendMessage(`:play_pause: "${track.title}" resumed`);
            }
        },

        time: msg => {
            var track = bot.queue.first;
            if(track && track.dispatcher) {
                var time = track.dispatcher.time / 1000;
                msg.channel.sendMessage(':clock2: time: {0} / {1}'
                .format(moment('00:00:00', 'HH:mm:ss').add(time, 's').format('HH:mm:ss'), track.length));
            }
        },

        youtube: msg => {
            var search = msg.details.trim();

            var targets = [];
            if(search[0] == '(' && search[search.length - 1] == ')') {
                search = search.replace('(', '').replace(')', '');
                targets = search.split(',');
            } else
                targets.push(search);

            __.all(targets, target => {
                var track = { type: 'youtube', search: target.trim(), requestor: msg.author.username };
                bot.queue.enqueue(track);
                bot.jukebox.info(track, msg, (err, info) => {
                    if(info) {
                        track.title = info ? info.title : 'Song';
                        track.length = moment('00:00:00', 'HH:mm:ss').add(parseInt(info.length_seconds), 's').format('HH:mm:ss');
                    }
                    msg.channel.sendMessage(`:heavy_plus_sign: Youtube Enqueued: "${track.title}" @ #${bot.queue.indexOf(track) + 1}`);
                });
            });
        },

        add: msg => {
            bot.commands.enqueue(msg);
        },

        enqueue: msg => {
            var parts = msg.details.split(':'),
                type = parts.shift().trim(),
                search = parts.join(':').trim();
                
            if(parts.length > 0 && songtypes.indexOf(type) > -1) {
                var targets = [];
                if(search[0] == '(' && search[search.length - 1] == ')') {
                    search = search.replace('(', '').replace(')', '');
                    targets = search.split(',');
                } else
                    targets.push(search);
                
                __.all(targets, target => {
                    var track = { type: type, search: target.trim(), requestor: msg.author.username };
                    bot.queue.enqueue(track);
                    bot.jukebox.info(track, msg, (err, info) => {
                        if(info) {
                            track.title = info ? info.title : 'Song';
                            track.length = moment('00:00:00', 'HH:mm:ss').add(parseInt(info.length_seconds), 's').format('HH:mm:ss');
                        }
                        msg.channel.sendMessage(`:heavy_plus_sign: Enqueued: "${track.title}" @ #${bot.queue.indexOf(track) + 1}`);
                    });
                });
            } else {
                msg.channel.sendMessage('Invalid Song Format, try: "{0}enqueue youtube:https://www.youtube.com/watch?v=dQw4w9WgXcQ"'
                    .format(bot.config.command.symbol));
            }
        },

        remove: msg => {
            bot.commands.dequeue(msg);
        },

        dequeue: msg => {
            var songidx = msg.details.trim();
            if(songidx != '') {
                songidx = parseInt(songidx) - 1;
                if(songidx == 0) {
                    bot.commands.stop(msg);
                }
                var track = bot.queue.at(songidx);
                msg.channel.sendMessage(`:heavy_minus_sign: Dequeued: ${track.title}`);
                bot.queue.remove((track, idx) => idx == songidx);
            }
        },

        skip: msg => {
            var track = bot.queue.first;
            if(track && track.dispatcher && msg && msg.channel) {
                track.dispatcher.end();
                msg.channel.sendMessage(`:fast_forward: "${track.title}" skipped`);
            }
        },

        stop: msg => {
            var track = bot.queue.first;
            if(track && track.dispatcher && msg && msg.channel) {
                track.playing = false;
                track.dispatcher.end();
                bot.paused = false;
                msg.channel.sendMessage(`:stop_button: "${track.title}" stopped`);
            }
        },

        list: msg => {
            var list = __.map(bot.queue.list, (track, idx) => `${idx + 1}. Type: "${track.type}" Title: "${track.title}${track.requestor ? ` Requested By: ${track.requestor}`:''}"`);
            if(list.length > 0)
                msg.channel.sendMessage(list.join('\n'));
            else
                msg.channel.sendMessage(':cd: There are no songs in the queue.');
        },

        clear: msg => {
            bot.commands.stop(msg);
            bot.queue.clear();
            msg.channel.sendMessage(':cd: Playlist Cleared');
        },

        move: msg => {
            var parts = msg.details.split(' '),
                current = parts[0],
                target = null;
            if(current && current != '') {
                current = parseInt(current) - 1;
                var track = bot.queue.at(current);
                target = parts[1].contains('up', true) ? current - 1 : (parts[1].contains('down', true) ? current + 1 : -1);
                if(target >= 0 && target <= bot.queue.count - 1) {
                    if(current == 0 || target == 0)
                        bot.commands.stop(msg);
                    bot.queue.move(current, target);
                    msg.channel.sendMessage(`:arrow_${target > current ? 'down' : 'up'}: Track: ${track.title} Moved to #${target + 1}`);
                }
            }
        },

        shuffle: msg => {
            bot.commands.stop(msg);
            bot.queue.shuffle();
            msg.channel.sendMessage(':arrows_counterclockwise: Queue Shuffled');
        },

        volume: msg => {
            var volume = msg.details.trim();
            if(volume != '') {
                volume = __.math.between(parseInt(volume), 0, 100);
                volume = (volume / 100) * (2 - 0.5) + 0.5;

                var track = bot.queue.first;
                if(track && track.dispatcher)
                    track.dispatcher.setVolume(volume);
                bot.config.stream.volume = volume;
                msg.channel.sendMessage(`:speaker: Volume set to ${volume * 100}%`);
            } else
                msg.channel.sendMessage(`:speaker: Volume set to ${bot.config.stream.volume * 100}%`);
        },

        repeat: msg => {
            bot.config.queue.repeat = !bot.config.queue.repeat;
            msg.channel.sendMessage(`Repeat mode is ${bot.config.queue.repeat ? 'on' : 'off'}`);
        },

        playlist: msg => {
            var parts = msg.details.split(':'),
                action = parts[0].toLowerCase(),
                operation = parts[1];
            __.switch(action, {
                save: () => {
                    if(operation != undefined) {
                        bot.playlist.save(operation);
                        msg.channel.sendMessage(`Playlist: "${operation}" has been saved`);
                    }
                },
                load: () => {
                    if(operation != undefined) {
                        bot.commands.stop(msg);
                        bot.playlist.load(operation);
                        msg.channel.sendMessage(`Playlist: "${operation}" has been loaded`);
                    }
                },
                delete: () => {
                    if(operation != undefined) {
                        bot.playlist.delete(operation);
                        msg.channel.sendMessage(`Playlist: "${operation}" has been deleted`);
                    }
                },
                list: () => {
                    var playlists = bot.playlist.list();
                    playlists = __.map(playlists, (x, y) => '{0}. {1}'.format(y + 1, x));
                    msg.channel.sendMessage(playlists.length > 0 ? playlists.join('\n') : 'There are no saved playlists');
                }
            });
        }

    };
};
