
const RhythmBot = require('./src/rhythm-bot.js');

const bot = new RhythmBot({
    command: {
        symbol: '-' // command symbol trigger
    },
    discord: {
        token: '<BOT-TOKEN-HERE>'//,
        // manage: {
        //     channels: [ 
        //         // Example text channel manager, limits media channel to 5 posts, limit should probably be less than 100 to avoid bugs
        //         { name: 'media', limit: 5 }  
        //     ]
        // }
    }
});

bot.connect().then(() => { bot.listen(); });