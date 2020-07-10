
import { parse, SuccessfulParsedMessage } from 'discord-command-parser';
import { Client, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import { ParsedArgs } from 'minimist';
import { Interface } from 'readline';
import * as yts from 'yt-search';
import { readDir, readFile, requireFile } from '../directory';
import { clone, fuse } from '../iteration/index';
import { IBot, IBotPlugin } from './bot-interface';
import { BotStatus } from './bot-status';
import { CommandMap } from './command-map';
import { BotConfig, DefaultBotConfig } from './config';
import { ConsoleReader } from './console-reader';
import { joinUserChannel, secondsToTimestamp } from './helpers';
import { logger } from './logger';
import { MediaPlayer } from './media';

const helptext = readFile('./helptext.txt');
const random = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};
const pingPhrases = [ 
    `Can't stop won't stop!`, 
    `:ping_pong: Pong Bitch!` 
];

export class Bot implements IBot {
    config: BotConfig;
    client: Client;
    status: BotStatus;
    commands: CommandMap;
    console: ConsoleReader;
    player: MediaPlayer;
    online: boolean;
    helptext: string;
    plugins: IBotPlugin[];

    constructor(config: BotConfig) {
        this.helptext = helptext;
        this.online = false;
        this.config = fuse(clone(DefaultBotConfig), config);
        this.commands = new CommandMap()
            .on('ping', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                let phrases = pingPhrases.slice();
                if(msg.guild)
                    phrases = phrases.concat(msg.guild.emojis.cache.array().map(x => x.name));
                msg.channel.send(random(phrases));
            })
            .on('help', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                msg.channel.send(this.helptext);
            })
            .on('join', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                joinUserChannel(msg)
                    .then(connection => {
                        this.player.connection = connection;
                        msg.channel.send(`:speaking_head: Joined channel: ${connection.channel.name}`);
                        if(this.config.auto.play)
                            this.player.play();
                    })
                    .catch(err => {
                        msg.channel.send(err);
                    });
            })
            .on('leave', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                this.player.stop();
                this.player.connection = null;
                this.client.voice.connections.forEach(conn => {
                    conn.disconnect();
                    msg.channel.send(`:mute: Disconnecting from channel: ${conn.channel.name}`);
                });
            })
            .on('play', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                new Promise(done => {
                    if(!this.player.connection) {
                        joinUserChannel(msg)
                            .then(conn => {
                                this.player.connection = conn;
                                msg.channel.send(`:speaking_head: Joined channel: ${conn.channel.name}`);
                                done();
                            });
                    } else
                        done();
                }).then(() => {
                    this.player.play();
                });
            })
            .on('pause', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                this.player.pause();
            })
            .on('time', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                let media = this.player.queue.first;
                if(this.player.playing && this.player.dispatcher) {
                    let elapsed = secondsToTimestamp(this.player.dispatcher.totalStreamTime / 1000);
                    msg.channel.send(`${elapsed} / ${media.duration}`);
                } else if(this.player.queue.first) {
                    msg.channel.send(`00:00:00 / ${media.duration}`);
                }
            })
            .on('search', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                yts({
                    query: cmd.body,
                    pages: 1
                }, (err, result) => {
                    result.videos
                        .slice(0, 3)
                        .forEach((v, idx) => {
                            const embed = new MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(`${v.title} (${v.timestamp})`)
                                .addField('Author:', `${v.author.name}`)
                                .setThumbnail(v.image)
                                .setURL(v.url);
                            msg.channel.send(embed)
                                .then(m => m.react(config.emojis.addSong));
                        });
                });
            })
            .on('add', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                if(cmd.arguments.length > 0) {
                    cmd.arguments.forEach(arg => {
                        let parts = arg.split(':');
                        if(parts.length == 2) {
                            this.player.addMedia({ type: parts[0], url: parts[1], requestor: msg.author.username });
                        } else
                            msg.channel.send(`Invalid type format`);
                    });
                }
            })
            .on('remove', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                if(cmd.arguments.length > 0) {
                    let idx = parseInt(cmd.arguments[0]);
                    let item = this.player.at(idx - 1);
                    if(item) {
                        this.player.remove(item);
                    }
                }
            })
            .on('skip', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                this.player.skip();
            })
            .on('stop', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                this.player.stop();
            })
            .on('list', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                let items = this.player.queue
                    .map((item, idx) => `${idx + 1}. Type: "${item.type}", Title: "${item.name}${item.requestor ? `", Requested By: ${item.requestor}`:''}"`);
                if(items.length > 0)
                    msg.channel.send(items.join('\n'));
                else
                    msg.channel.send(`:cd: There are no songs in the queue.`);
            })
            .on('clear', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                this.player.clear();
            })
            .on('move', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                if(cmd.arguments.length > 1) {
                    let current = Math.min(Math.max(parseInt(cmd.arguments[0]), 0), this.player.queue.length - 1),
                        targetDesc = cmd.arguments[0],
                        target = 0;
                    if(targetDesc == 'up')
                        target = Math.min(current - 1, 0);
                    else if(targetDesc == 'down')
                        target = Math.max(current + 1, this.player.queue.length - 1);
                    else
                        target = parseInt(targetDesc);

                    this.player.move(current, target);
                }
            })
            .on('shuffle', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                this.player.shuffle();
            })
            .on('volume', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                if(cmd.arguments.length > 0) {
                    let temp = cmd.arguments[0];
                    if(temp) {
                        let volume = Math.min(Math.max(parseInt(temp), 0), 100);
                        this.player.setVolume(volume);
                    }
                }
                msg.channel.send(`:speaker: Volume is at ${this.player.getVolume()}`);
            })
            .on('repeat', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                this.config.queue.repeat = !this.config.queue.repeat;
                msg.channel.send(`Repeat mode is ${this.config.queue.repeat ? 'on':'off'}`);
            });

        this.client = new Client()
            .on('message', (msg: Message) => {
                let parsed = parse(msg, this.config.command.symbol);
                if(!parsed.success) return;
                let handlers = this.commands.get(parsed.command);
                if(handlers) {
                    logger.debug(`Bot Command: ${msg.content}`);
                    // TODO make the player able to handle multiple channels
                    this.player.channel = msg.channel;
                    handlers.forEach(handle => {
                        handle(parsed, msg);
                    });
                }
            })
            .on('messageReactionAdd', (msg: MessageReaction, user: User) => {
                if (msg.message.author.id === this.client.user.id && user.id !== this.client.user.id) {
                    if (msg.message.embeds.length > 0) {
                        const embed = msg.message.embeds[0];
                        if (embed) {
                            if (msg.emoji.name === config.emojis.addSong && embed.url) {
                                this.player.addMedia({ type: 'youtube', url: embed.url, requestor: user.username });
                            }
                        }
                        msg.users.remove(user.id);
                    }
                }
            })
            .on('ready', () => {
                if(this.online)
                    logger.debug('Reconnected!');
                else
                    logger.debug('Rhythm Bot Online!');
                this.online = true;
                this.player.determineStatus();
            })
            .on('disconnect', () => {
                this.online = false;
                logger.debug('Disconnected!');
            })
            .on('error', (error: Error) => {
                logger.error(error);
            })
            .on('guildMemberUpdate', () => {
                
            })
            .on('guildMemberSpeaking', () => {
                
            });
        
        this.console = new ConsoleReader();
        this.console.commands
            .on('exit', (args: ParsedArgs, rl: Interface) => {
                if(this.client)
                    this.client.destroy();
                rl.close();
            });
        
        this.status = new BotStatus(this.client);
        this.player = new MediaPlayer(this.config, this.status);

        let files = readDir('./dist/plugins');
        if(files) {
            this.plugins = files
                .filter(file => !file.endsWith('.map'))
                .map(file => requireFile('./dist/plugins', file).default)
                .map(construct => new construct());
            this.plugins.forEach(plugin => plugin.preInitialize(this));
            this.plugins.forEach(plugin => plugin.postInitialize(this));
        }
    }

    connect(): Promise<string> {
        return this.client.login(this.config.discord.token);
    }

    listen() {
        return this.console.listen();
    }

}
