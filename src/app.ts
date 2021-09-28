import * as fs from 'fs';
import { requireFile, projectDir, writeJson } from 'discord-bot-quickstart';
import { IRhythmBotConfig, RhythmBot } from './bot';

(async () => {
    try {
        const configPath = projectDir('../bot-config.json');
        if (!fs.existsSync(configPath)) {
            await writeJson({ discord: { token: '<BOT-TOKEN>' } }, configPath);
        }
        
        let config: IRhythmBotConfig = requireFile('../bot-config.json');
        
        const bot = new RhythmBot(config);
        
        if (!!config && config.discord.token === '<BOT-TOKEN>') {
            bot.logger.debug('Invalid Token - Create valid token in the Discord Developer Portal');
            console.error('Invalid Token - Create valid token in the Discord Developer Portal');
            process.exit(0);
        }
        
        await bot.connect();
        bot.logger.debug('Rhythm Bot Online');
        bot.listen();
        
    } catch (error) {
        console.error(error);
    }
})();
