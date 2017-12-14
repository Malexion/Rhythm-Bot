
const __ = require('iterate-js');
const moment = require('moment');
const logger = require('../logger.js');

module.exports = function(bot) {
    var STATE = __.enum({
        READY: 0,
        PLAYING: 1,
        PAUSED: 2
    });

    bot.clock = new __.lib.StopWatch({
        onTick: (time) => {
            if(bot.online) {
                var track = bot.queue.first,
                    title = '',
                    currentTime = 0,
                    totalTime = 0;

                if(track && track.dispatcher) {
                    var time = track.dispatcher.time / 1000,
                        format = 'mm:ss',
                        end = moment(track.length, 'HH:mm:ss');

                    if(end.hours() > 0)
                        form = 'HH:' + form;

                    title = track.title;
                    currentTime = moment('00:00:00', 'HH:mm:ss').add(time, 's').format(format);
                    totalTime = end.format(format);
                }
                
                if(bot.queue.count > 0 && bot.queue.first.playing) {
                    if(bot.queue.first.paused)
                        bot.state = STATE.PAUSED;
                    else
                        bot.state = STATE.PLAYING;
                } else
                    bot.state = STATE.READY;

                var text = __.switch(bot.state, {
                    [STATE.READY]: `Ready: ${bot.queue.count} in queue.`,
                    [STATE.PLAYING]: `${currentTime}/${totalTime}`,
                    [STATE.PAUSED]: `Paused: ${title} - ${currentTime} / ${totalTime}`
                });

                if(__.prop(bot.client, 'user.presence.game.name') != text) {
                    logger.log(`Status: ${text}`);
                    bot.client.user.setGame(text);
                }
            }
        },
        tickRate: 10000
    });
};
