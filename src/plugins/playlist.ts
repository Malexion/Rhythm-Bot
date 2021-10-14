import { IRhythmBotConfig, RhythmBot } from '../bot';
import { createInfoEmbed } from '../helpers';
import {
    IBot,
    IBotPlugin,
    readDir,
    readJson,
    writeJson,
    deleteFile,
    fileExists,
    SuccessfulParsedMessage,
    CommandMap,
    IBotConfig,
} from 'discord-bot-quickstart';
import { Message, Client } from 'discord.js';
import { EntityRepository } from '@mikro-orm/core';
import { ORM } from '../app';
import { Playlist } from '../media/playlist.model';
import { MediaItem } from '../media/media-item.model';

export default class PlaylistPlugin extends IBotPlugin {
    bot: RhythmBot;
    playlistRepo: EntityRepository<Playlist> = ORM.em.getRepository(Playlist);
    playlistItemRepo: EntityRepository<MediaItem> = ORM.em.getRepository(MediaItem);

    preInitialize(bot: IBot<IRhythmBotConfig>) {
        this.bot = bot as RhythmBot;
    }

    registerDiscordCommands(map: CommandMap<(cmd: SuccessfulParsedMessage<Message>, msg: Message) => void>) {
        map.on('playlist', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
            switch (cmd.arguments[0]) {
                case 'load':
                    this.load(cmd, msg);
                    break;
                case 'save':
                    this.save(cmd, msg);
                    break;
                case 'delete':
                    this.delete(cmd, msg);
                    break;
                case 'list':
                    this.list(cmd, msg);
                    break;
                default:
                    msg.channel.send(createInfoEmbed(`Unknown command`));
                    break;
            }
        });
    }

    async list(cmd: SuccessfulParsedMessage<Message>, msg: Message) {
        const playlists = await this.playlistRepo.findAll({ fields: ['name'] });

        msg.channel.send(
            createInfoEmbed(
                `Playlists`,
                `${playlists.length == 0 ? 'No playlists' : playlists.map((p) => p.name).join('\n')}`
            )
        );
    }

    async load(cmd: SuccessfulParsedMessage<Message>, msg: Message) {
        let name = cmd.arguments[1];
        if (name) {
            const queue = await this.playlistRepo.findOneOrFail({ name }).catch(() => {
                msg.channel.send(createInfoEmbed(`Could not find playlist "${name}"`));
            });

            if (queue instanceof Playlist) {
                if (cmd.arguments[2] == 'append') {
                    this.bot.player.queue.push(...queue.list);
                } else {
                    this.bot.player.clear();
                    this.bot.player.queue.push(...queue.list);
                }
                this.bot.player.determineStatus();
                msg.channel.send(createInfoEmbed(`Loaded playlist "${name}"`));
            }
        }
    }

    async save(cmd: SuccessfulParsedMessage<Message>, msg: Message) {
        let name = cmd.arguments[1];
        if (name) {
            let queue = ORM.em.create(Playlist, {
                name,
                list: this.bot.player.queue,
            });

            if (queue.list.length > 0) {
                await this.playlistRepo.persist(queue).flush();
                msg.channel.send(createInfoEmbed(`Saved playlist "${name}"`));
            } else {
                msg.channel.send(createInfoEmbed(`Cannot save empty playlist`));
            }
        }
    }

    async delete(cmd: SuccessfulParsedMessage<Message>, msg: Message) {
        let name = cmd.arguments[1];
        if (name) {
            const [deletedPlaylist] = await Promise.all([
                this.playlistRepo.nativeDelete({ name }),
                this.playlistItemRepo.nativeDelete({ playlist: { name } }),
            ]);

            if (deletedPlaylist > 0) {
                msg.channel.send(createInfoEmbed(`Deleted playlist "${name}"`));
            } else {
                msg.channel.send(createInfoEmbed(`Playlist not found "${name}"`));
            }
        }
    }

    registerConsoleCommands() {}

    clientBound() {}

    postInitialize() {}

    onReady() {}
}
