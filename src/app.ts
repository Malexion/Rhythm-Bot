import * as fs from 'fs';
import { requireFile, writeJson, logger, BotConfig, Bot } from './resources';

if (!fs.existsSync('./bot-config.json')) {
    writeJson({ discord: { token: '<BOT-TOKEN>' } }, './bot-config.json');
}
let config: BotConfig = requireFile('./bot-config.json');

if (!!config && config.discord.token === '<BOT-TOKEN>') {
    logger.debug('Invalid Token - Create valid token in the Discord Developer Portal');
    console.log('Invalid Token - Create valid token in the Discord Developer Portal');
    process.exit(0);
}

let bot = new Bot(config);

bot.connect()
    .then(() => {
        logger.debug('Bot Ready');
        console.log('Bot Online');
        bot.listen();
    })
    .catch(err => logger.error(err));
