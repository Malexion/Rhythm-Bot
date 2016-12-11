"use strict";

const __ = require('iterate-js');

const init = require('./load.js');

module.exports = __.class(function(cfg) {
    init(this, cfg);
}, {
    connect: function() {
        return this.client.login(this.config.discord.token);
    },
    disconnect: function() {
        return this.client.destroy();
    },
    listen: function() {
        this.console.listen();
    }
});
