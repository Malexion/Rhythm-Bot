import { IRhythmBotConfig,RhythmBot } from '../bot';
import { MediaItem } from '../media';
import { createInfoEmbed } from '../helpers';
import { IBot, IBotPlugin, readDir, readJson, writeJson, deleteFile, fileExists, SuccessfulParsedMessage, CommandMap, IBotConfig } from 'discord-bot-quickstart';
import { Message, Client } from 'discord.js';

const playlistDir = '../playlists';

interface IPlaylist {
    list?: Array<MediaItem>;
}

export default class PlaylistPlugin extends IBotPlugin {
    bot: RhythmBot;

    preInitialize(bot: IBot<IRhythmBotConfig>) {
        this.bot = bot as RhythmBot;
    }

    registerDiscordCommands(map: CommandMap<(cmd: SuccessfulParsedMessage<Message>, msg: Message) => void>) {
        map.on('playlist', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
            switch(cmd.arguments[0]) {
                case 'load': this.load(cmd, msg); break;
                case 'save': this.save(cmd, msg); break;
                case 'delete': this.delete(cmd, msg); break;
                default: this.list(cmd, msg); break;   
            }
        });
    }

    list(cmd: SuccessfulParsedMessage<Message>, msg: Message) {
        let files = readDir(playlistDir)
            .filter(file => file.includes('.json'))
            .map((file, i) => `${i + 1}. ${file.replace('.json', '')}`);

<<<<<<< HEAD
            msg.channel.client.user.send(`Playlists: \n\n${files.length == 0 ? 'No Playlists' : files.join('\n')}`);
=======
        msg.channel.send(createInfoEmbed(`Playlists`, `${files.length == 0 ? 'No Playlists' : files.join('\n')}`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
    }

    load(cmd: SuccessfulParsedMessage<Message>, msg: Message) {
        let name = cmd.arguments[1];
        if(name) {
            let queue: IPlaylist = readJson(playlistDir, `${name}.json`) || { list: [] };
            if(queue.list) {
                if(cmd.arguments[2] == 'append') {
                    this.bot.player.queue.push(...queue.list);
                } else {
                    this.bot.player.clear();
                    this.bot.player.queue.push(...queue.list);
                }
<<<<<<< HEAD
                bot.player.determineStatus();
                msg.channel.client.user.send(`Loaded Playlist "${name}"`);
=======
                this.bot.player.determineStatus();
                msg.channel.send(createInfoEmbed(`Loaded Playlist "${name}"`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
            }
        }
    }

    save(cmd: SuccessfulParsedMessage<Message>, msg: Message) {
        let name = cmd.arguments[1];
        if(name) {
            let queue: IPlaylist = { list: this.bot.player.queue.map(x => x) };
            if(queue.list.length > 0) {
                writeJson(queue, playlistDir, `${name}.json`);
            }
<<<<<<< HEAD
            msg.channel.client.user.send(`Saved Playlist "${name}"`);
=======
            msg.channel.send(createInfoEmbed(`Saved Playlist "${name}"`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
        }
    }

    delete(cmd: SuccessfulParsedMessage<Message>, msg: Message) {
        let name = cmd.arguments[1];
        if(name && fileExists(playlistDir, `${name}.json`)) {
            deleteFile(playlistDir, `${name}.json`);
<<<<<<< HEAD
            msg.channel.client.user.send(`Deleted Playlist "${name}"`);
=======
            msg.channel.send(createInfoEmbed(`Deleted Playlist "${name}"`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
        }
    }

    registerConsoleCommands() { }

    clientBound() { }

    postInitialize() { }

    onReady() { }

}
