import * as fs from 'fs';
import { requireFile, projectDir, writeJson } from 'discord-bot-quickstart';
import { config as dotenv } from 'dotenv';

import { IRhythmBotConfig, RhythmBot } from './bot';

dotenv();

(async () => {
    try {
        let config: IRhythmBotConfig;

        if (process.env.DISCORD_TOKEN == null) {
            const configPath = projectDir('../bot-config.json');
            if (!fs.existsSync(configPath)) {
                await writeJson({ discord: { token: '<BOT-TOKEN>' } }, configPath);
            }
            requireFile(configPath);
        } else {
            config = readConfigFromEnv();
        }

        console.log(config);

        const bot = new RhythmBot(config);

        if (!!config && config.discord.token === '<BOT-TOKEN>') {
            bot.logger.debug('Invalid Token - Create valid token in the Discord Developer Portal');
            console.log('Invalid Token - Create valid token in the Discord Developer Portal');
            process.exit(0);
        }

        bot.connect().then(() => {
            bot.logger.debug('Rhythm Bot Online');
            bot.listen();
        });
    } catch (error) {
        console.error(error);
    }
})();

function readConfigFromEnv(): IRhythmBotConfig {
    const config: IRhythmBotConfig = {} as any;

    if (process.env.COMMAND_SYMBOL != null) {
        config.command = config.command ?? ({} as any);
        config.command.symbol = process.env.COMMAND_SYMBOL;
    }

    if (process.env.DISCORD_TOKEN != null) {
        config.discord = config.discord ?? ({} as any);
        config.discord.token = process.env.DISCORD_TOKEN;
    }
    if (process.env.DISCORD_LOG != null) {
        config.discord = config.discord ?? ({} as any);
        config.discord.log = /true/i.test(process.env.DISCORD_LOG);
    }

    if (process.env.DIRECTORY_PLUGINS != null) {
        config.directory = config.directory ?? ({} as any);
        config.directory.plugins = process.env.DIRECTORY_PLUGINS;
    }
    if (process.env.DIRECTORY_LOGS != null) {
        config.directory = config.directory ?? ({} as any);
        config.directory.logs = process.env.DIRECTORY_LOGS;
    }

    if (process.env.AUTO_DEAFEN != null) {
        config.auto = config.auto ?? ({} as any);
        config.auto.deafen = /true/i.test(process.env.AUTO_DEAFEN);
    }
    if (process.env.AUTO_PAUSE != null) {
        config.auto = config.auto ?? ({} as any);
        config.auto.pause = /true/i.test(process.env.AUTO_PAUSE);
    }
    if (process.env.AUTO_PLAY != null) {
        config.auto = config.auto ?? ({} as any);
        config.auto.play = /true/i.test(process.env.AUTO_PLAY);
    }
    if (process.env.AUTO_RECONNECT != null) {
        config.auto = config.auto ?? ({} as any);
        config.auto.reconnect = /true/i.test(process.env.AUTO_RECONNECT);
    }

    if (process.env.QUEUE_ANNOUNCE != null) {
        config.queue = config.queue ?? ({} as any);
        config.queue.announce = /true/i.test(process.env.QUEUE_ANNOUNCE);
    }
    if (process.env.QUEUE_REPEAT != null) {
        config.queue = config.queue ?? ({} as any);
        config.queue.repeat = /true/i.test(process.env.QUEUE_REPEAT);
    }

    if (process.env.STREAM_SEEK != null) {
        config.stream = config.stream ?? ({} as any);
        config.stream.seek = parseFloat(process.env.STREAM_SEEK);
    }
    if (process.env.STREAM_PACKET_LOSS_PERCENTAGE != null) {
        config.stream = config.stream ?? ({} as any);
        config.stream.packetLossPercentage = parseFloat(process.env.STREAM_PACKET_LOSS_PERCENTAGE);
    }
    if (process.env.STREAM_FORWARD_ERROR_CORRECTION != null) {
        config.stream = config.stream ?? ({} as any);
        config.stream.forwardErrorCorrection = /true/i.test(process.env.STREAM_FORWARD_ERROR_CORRECTION);
    }
    if (process.env.STREAM_VOLUME != null) {
        config.stream = config.stream ?? ({} as any);
        config.stream.volume = parseFloat(process.env.STREAM_VOLUME);
    }
    if (process.env.STREAM_BITRATE != null) {
        config.stream = config.stream ?? ({} as any);
        config.stream.bitrate = parseFloat(process.env.STREAM_BITRATE);
    }

    if (process.env.EMOJIS_ADD_SONG != null) {
        config.emojis = config.emojis ?? ({} as any);
        config.emojis.addSong = process.env.EMOJIS_ADD_SONG;
    }
    if (process.env.EMOJIS_STOP_SONG != null) {
        config.emojis = config.emojis ?? ({} as any);
        config.emojis.stopSong = process.env.EMOJIS_STOP_SONG;
    }
    if (process.env.EMOJIS_PLAY_SONG != null) {
        config.emojis = config.emojis ?? ({} as any);
        config.emojis.playSong = process.env.EMOJIS_PLAY_SONG;
    }
    if (process.env.EMOJIS_PAUSE_SONG != null) {
        config.emojis = config.emojis ?? ({} as any);
        config.emojis.pauseSong = process.env.EMOJIS_PAUSE_SONG;
    }
    if (process.env.EMOJIS_SKIP_SONG != null) {
        config.emojis = config.emojis ?? ({} as any);
        config.emojis.skipSong = process.env.EMOJIS_SKIP_SONG;
    }

    return config;
}
