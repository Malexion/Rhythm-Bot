"use strict";

// Lib
const __ = require('iterate-js');
const Discord = require('discord.js');

// Custom Plugin Modules
const Queue = require('./queue.js');
const config = require('./config.js');
const consolereader = require('./consolereader.js');
const commands = require('./commands.js');
const events = require('./events.js');
const playlists = require('./playlists.js');
const jukebox = require('./jukebox.js');
const watcher = require('./channelmanager.js');

// Plugin attachment
const attach = function(context, plugin, args) {
    args = __.is.array(args) ? args : [ args ];
    if(__.is.function(plugin)) {
        if(args[0] != context)
            args.unshift(context);
        plugin.apply(context, args);
    } else if(__.is.array(plugin))
        __.all(plugin, x => attach(context, x, args));
};

module.exports = __.class(function(cfg) {
    var bot = this;
    bot.client = new Discord.Client();
    bot.queue = new Queue();
    attach(bot, config, cfg);
    attach(bot, [ consolereader, commands, events, playlists, jukebox, watcher ]);
}, {
    connect: function() {
        return this.client.login(this.config.discord.token);
    },
    disconnect: function() {
        return this.client.destroy();
    },
    listen: function() {
        if(this.console)
            this.console.listen();
    }
});
