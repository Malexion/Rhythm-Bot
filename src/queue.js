
const __ = require('iterate-js');

module.exports = __.class(function() {
    this.queue = [];
}, {
    count: {
        get: function() {
            return this.queue.length;
        }
    },
    list: {
        get: function() {
            return this.queue.slice();
        }
    },
    first: {
        get: function() {
            return this.queue[0];
        }
    },
    last: {
        get: function() {
            return this.queue[queue.length - 1];
        }
    },
    at: function(idx) {
        return this.queue[idx];
    },
    indexOf: function(item) {
        return __.search(this.queue, x => x == item, { getKey: true });
    },
    dequeue: function() {
        return this.queue.shift();
    },
    enqueue: function(item) {
        this.queue.push(item);
    },
    move: function(current, target) {
        this.queue = __.move(this.queue, current, target);
    },
    clear: function() {
        this.queue = [];
    },
    remove: function(func) {
        var key = __.search(this.queue, func, { getKey: true });
        if(__.is.set(key))
            this.queue.splice(key, 1);
    },
    shuffle: function() {
        var currentIndex = this.queue.length, 
        temporaryValue, 
        randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = this.queue[currentIndex];
            this.queue[currentIndex] = this.queue[randomIndex];
            this.queue[randomIndex] = temporaryValue;
        }
    }
});