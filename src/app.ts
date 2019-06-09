
import { requireFile } from './directory';
import { BotConfig } from './bot/config';
import { Bot } from './bot/bot';
import { logger } from './bot/logger';

let config: BotConfig = requireFile('./bot-config.json');

let bot = new Bot(config);

bot.connect()
    .then(() => {
        logger.debug('Bot Ready');
        console.log('Bot Online');
        bot.listen();
    })
    .catch(err => logger.error(err));
