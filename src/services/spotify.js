
const __ = require('iterate-js');
const agent = require('superagent');
const jsonbinder = require('superagent-jsonapify');
const through = require('through2');
const SpotifyWebApi = require('spotify-web-api-node');
const logger = require('../logger.js');

jsonbinder(agent);
const trackurl = 'https://api.spotify.com/v1/tracks/{0}';

var spotify = function(bot, uri) {
    var stream = through();
    spotify.init(bot, api => {

    });
    // Spotify[creds.type](creds.id, creds.secret, function(err, api) {
    //     if(err) throw err;
    //     api.get(uri, function(err, track) {
    //         if(err) throw err;
    //         track.play()
    //              .pipe(stream)
    //              .on('finish', api.disconnect.bind(api));
    //     });
    // });
    return stream;
};

spotify.getInfo = function(uri, cb) {
    agent.get(trackurl.format(uri))
         .then(res => {
             var x = res.body;
             cb(null, {
                 id: x.id,
                 uri: x.uri,
                 title: '{0}{1}'.format(x.name, x.artists.length > 0 ? ' by {0}'.format(__.map(x.artists, v => v.name).join(', ')) : ''),
                 length_seconds: x.duration_ms / 1000
             });
         }).catch(res => {
             cb('Could not find track', {});
         });
};

spotify.init = function(bot, cb) {
    var creds = bot.config.spotify;
    var spotifyApi = new SpotifyWebApi({
        clientId : creds.id,
        clientSecret : creds.secret
    });
    spotifyApi.clientCredentialsGrant()
        .then((data) => {
            spotifyApi.setAccessToken(data.body['access_token']);
            cb(spotifyApi);
        }, (err) => {
            logger.error('Something went wrong when retrieving an access token', err);
        });
};

module.exports = spotify;
