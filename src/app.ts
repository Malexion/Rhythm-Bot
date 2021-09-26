require('dotenv').config()
import * as fs from 'fs';
import { requireFile, projectDir, writeJson } from 'discord-bot-quickstart';
import { IRhythmBotConfig, RhythmBot } from './bot';

(async () => {
  const configPath = projectDir('../bot-config.json');
  // Because of how we are deploying this bot, this should only be ran once.
  if (!fs.existsSync(configPath)) {
    // This function creates the file attempting to be fetched in the config path and inserts the data passed in the
    // first argument as text in the file.
    await writeJson({ discord: { token: process.env.BOT_TOKEN } }, configPath);
  }
  
  let config: IRhythmBotConfig = requireFile('../bot-config.json');

  const bot = new RhythmBot(config);

  if (config && config.discord.token !== process.env.BOT_TOKEN) {
    bot.logger.debug('Invalid Token - Create valid token in the Discord Developer Portal');
    console.log('Invalid Token - Create valid token in the Discord Developer Portal');
    process.exit(0);
  }

  bot.connect()
    .then(() => {
      bot.logger.debug('Rhythm Bot Online');
      bot.listen();
    })
    .catch(err => bot.logger.error(err));
})();
