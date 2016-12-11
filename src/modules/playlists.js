
const __ = require('iterate-js');
const fs = require('fs');
const jsonfile = require('jsonfile');

const playlistPath = '/playlists';

module.exports = function(bot) {
    bot.playlist = {
        path: function(name) {
            return '{0}/{1}/{2}.json'.format(bot.dir, playlistPath, name);
        },
        dir: '{0}/{1}'.format(bot.dir, playlistPath),
        save: function(name, list) {
            var list = __.map(list ? list : bot.queue.queue, x => {
                var temp = {};
                __.all(x, (value, key) => { 
                    if(key != 'dispatcher' && key != 'playing' && key != 'requestor')
                        temp[key] = value; 
                });
                return temp;
            });
            jsonfile.writeFileSync(bot.playlist.path(name), { queue: list });
        },
        load: function(name) {
            bot.queue.queue = (jsonfile.readFileSync(bot.playlist.path(name)) || { queue: [] }).queue;
        },
        list: function() {
            var playlists = [];
            fs.readdirSync(bot.playlist.dir).forEach(file => {
                var fileparts = file.split('/'),
                    filename = fileparts[fileparts.length - 1].replace('.json', '');
                
                playlists.push(filename);
            });
            return playlists;
        },
        delete: function(name) {
            fs.unlinkSync(bot.playlist.path(name));
        }
    };
};