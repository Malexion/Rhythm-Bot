
const fs = require('fs');
const __ = require('iterate-js');
const Discord = require('discord.js');
const Queue = require('./queue.js');
const config = require('./default-config.js');
const modules = __.map(fs.readdirSync('./src/modules'), mod => require(`./modules/${mod}`));
const plugins = __.map(fs.readdirSync('./src/plugins'), mod => require(`./plugins/${mod}`));

module.exports = function(bot, cfg) {
    bot.dir = __dirname;
    bot.client = new Discord.Client();
    bot.queue = new Queue();
    config(bot, cfg);
    __.all(modules, mod => mod(bot));
    __.all(plugins, plugin => plugin(bot));
};
