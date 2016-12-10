
const spotify = require('./src/services/spotify.js');

const bot = {
    config: {
        spotify: {
            id: 'a8b02643b2c944a2830dbea6c07cc092',
            secret: '9141e0a5238f4f69a6522005e76a880a'
        }
    }
};

spotify.init(bot, api => {
    api.getTracks([ '6tdp8sdXrXlPV6AZZN2PE8' ])
        .then(data => {
            var track = data.body.tracks[0];
            console.log(track);
        })
        .catch(error => {
            console.log(error);
        });
});