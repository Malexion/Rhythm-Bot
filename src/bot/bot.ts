<<<<<<< HEAD

import { parse, ParsedMessage } from 'discord-command-parser';
import { Client, Message, Channel, TextChannel} from 'discord.js';
import { ParsedArgs } from 'minimist';
import { Interface } from 'readline';
import { readDir, readFile, requireFile } from '../directory';
import { clone, fuse } from '../iteration/index';
import { IBot, IBotPlugin } from './bot-interface';
import { BotStatus } from './bot-status';
import { CommandMap } from './command-map';
import { BotConfig, DefaultBotConfig } from './config';
import { ConsoleReader } from './console-reader';
import { joinUserChannel, secondsToTimestamp } from './helpers';
import { logger } from './logger';
import { MediaPlayer, MediaItem } from './media';
=======
import { MediaPlayer } from '../media';
import { BotStatus } from './bot-status';
import { IRhythmBotConfig } from './bot-config';
import { joinUserChannel, createInfoEmbed, createErrorEmbed, secondsToTimestamp, createEmbed } from '../helpers';
import { IBot, CommandMap, Client, ParsedArgs, Interface, SuccessfulParsedMessage, Message, readFile, MessageReaction, User } from 'discord-bot-quickstart';
import * as yts from 'yt-search';
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5

const helptext = readFile('../helptext.txt');
const random = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};
const pingPhrases = [ 
    `Can't stop won't stop!`, 
    `:ping_pong: Pong Bitch!` 
];

<<<<<<< HEAD
export class Bot implements IBot {
    config: BotConfig;
    client: Client;
    status: BotStatus;
    commands: CommandMap;
    console: ConsoleReader;
    player: MediaPlayer;
    mediaItem:MediaItem;
    online: boolean;
=======
export class RhythmBot extends IBot<IRhythmBotConfig> {
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
    helptext: string;
    player: MediaPlayer;
    status: BotStatus;

    constructor(config: IRhythmBotConfig) {
        super(config, <IRhythmBotConfig>{
            auto: {
                deafen: false,
                pause: false,
                play: false,
                reconnect: true
            },
            discord: {
                log: true
            },
            command: {
                symbol: '!'
            },
            directory: {
                plugins: './plugins',
                logs: '../bot.log'
            },
            queue: {
                announce: true,
                repeat: false
            },
            stream: {
                seek: 0,
                volume: 1,
                bitrate: 'auto',
                forwardErrorCorrection: false
            },
            emojis: {
                addSong: '👍',
                stopSong: '⏹️',
                playSong: '▶️',
                pauseSong: '⏸️',
                skipSong: '⏭️'
            }
        });
        this.helptext = helptext;
    }

    onRegisterDiscordCommands(map: CommandMap<(cmd: SuccessfulParsedMessage<Message>, msg: Message) => void>): void {
        map.on('ping', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                let phrases = pingPhrases.slice();
<<<<<<< HEAD
                if(msg.guild){
                 //  phrases = phrases.concat(msg.guild.emojis.array().map(x => x.name));
               
                   for (let index = 0; index < msg.toString.length; index++) {
                       phrases.concat(msg.toString[index].name);
                       
                   }
                   
                }
            })
            .on('help', (cmd: ParsedMessage, msg: Message) => {
               //msg.channel.id =  id-ul canalulul text
            (msg.channel as TextChannel).send(this.helptext)

=======
                if(msg.guild)
                    phrases = phrases.concat(msg.guild.emojis.cache.array().map(x => x.name));
                msg.channel.send(random(phrases));
            })
            .on('help', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                msg.channel.send(this.helptext);
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
            })
            .on('join', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                joinUserChannel(msg)
                    .then(connection => {
                        this.player.connection = connection;
<<<<<<< HEAD
                        (msg.channel as TextChannel).send(`:speaking_head: Joined channel: ${connection.channel.name}`);
=======
                        msg.channel.send(createInfoEmbed(`Joined Channel: ${connection.channel.name}`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
                        if(this.config.auto.play)
                            this.player.play();
                    })
                    .catch(err => {
<<<<<<< HEAD
                        (msg.channel as TextChannel).send(err);
=======
                        msg.channel.send(createErrorEmbed(err));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
                    });
            })
            .on('leave', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                this.player.stop();
                this.player.connection = null;
<<<<<<< HEAD
                this.client.voice.connections.forEach(conn => {///this.client.voiceconnection
                    conn.disconnect();
                    (msg.channel as TextChannel).send(`:mute: Disconnecting from channel: ${conn.channel.name}`);
=======
                this.client.voice.connections.forEach(conn => {
                    conn.disconnect();
                    msg.channel.send(createInfoEmbed(`Disconnecting from channel: ${conn.channel.name}`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
                });
            })
            .on('play', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                new Promise(done => {
                    if(!this.player.connection) {
                        joinUserChannel(msg)
                            .then(conn => {
                                this.player.connection = conn;
<<<<<<< HEAD
                                (msg.channel as TextChannel).send(`:speaking_head: Joined channel: ${conn.channel.name}`);
=======
                                msg.channel.send(createInfoEmbed(`Joined Channel: ${conn.channel.name}`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
                                done();
                            });
                    } else
                        done();
                }).then(() => {
                   
                   if(cmd.arguments.length<0)
                    this.player.play();
                    else if(cmd.arguments.length>0){
                        let arglink =  cmd.arguments[0];
                        if(arglink.match("^(http(s):\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+")){
                            this.player.addMedia({type:'youtube', url:arglink,requestor:msg.author.username});
                            this.player.play();

                        }else{
                            (msg.channel as TextChannel).send(`Invalid argument !`);
                        }
                            

                    }
                });
            })
            .on('pause', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                this.player.pause();
            })
            .on('time', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                let media = this.player.queue.first;
                if(this.player.playing && this.player.dispatcher) {
                    let elapsed = secondsToTimestamp(this.player.dispatcher.totalStreamTime / 1000);
<<<<<<< HEAD
                    (msg.channel as TextChannel).send(`${elapsed} / ${media.duration}`);
                } else if(this.player.queue.first) {
                    (msg.channel as TextChannel).send(`00:00:00 / ${media.duration}`);
=======
                    msg.channel.send(createInfoEmbed('Time Elapsed', `${elapsed} / ${media.duration}`));
                } else if(this.player.queue.first) {
                    msg.channel.send(createInfoEmbed('Time Elapsed', `00:00:00 / ${media.duration}`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
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
                            const embed = createEmbed()
                                .setTitle(`${v.title}`)
                                .addField('Author:', `${v.author.name}`, true)
                                .addField('Duration', `${v.timestamp}`, true)
                                .setThumbnail(v.image)
                                .setURL(v.url);
                            msg.channel.send(embed)
                                .then(m => m.react(this.config.emojis.addSong));
                        });
                });
            })
            .on('add', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                if(cmd.arguments.length > 0) {
                    cmd.arguments.forEach(arg => {
<<<<<<< HEAD

                        //youtube only...for now
                        if(arg.match("^(http(s):\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+")){
                            this.player.addMedia({type:'youtube', url:arg,requestor:msg.author.username});

                        }else{
                            (msg.channel as TextChannel).send(`Invalid type format`);
                        }

=======
                        let parts = arg.split(':');
                        if(parts.length == 2) {
                            this.player.addMedia({ type: parts[0], url: parts[1], requestor: msg.author.username });
                        } else
                            msg.channel.send(createErrorEmbed(`Invalid media type format`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
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
<<<<<<< HEAD
                (msg.channel as TextChannel).send(items.join('\n'));
                else
                (msg.channel as TextChannel).send(`:cd: There are no songs in the queue.`);
=======
                    msg.channel.send(createInfoEmbed('Current Playing Queue', items.join('\n\n')));
                else
                    msg.channel.send(createInfoEmbed(`There are no songs in the queue.`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
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
<<<<<<< HEAD
                (msg.channel as TextChannel).send(`:speaker: Volume is at ${this.player.getVolume()}`);
=======
                msg.channel.send(createInfoEmbed(`Volume is at ${this.player.getVolume()}`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
            })
            .on('repeat', (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
                this.config.queue.repeat = !this.config.queue.repeat;
<<<<<<< HEAD
                (msg.channel as TextChannel).send(`Repeat mode is ${this.config.queue.repeat ? 'on':'off'}`);
               
=======
                msg.channel.send(createInfoEmbed(`Repeat mode is ${this.config.queue.repeat ? 'on':'off'}`));
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
            });
    }

<<<<<<< HEAD
        this.client = new Client()
            .on('message', (msg: Message) => {
                let parsed = parse(msg, this.config.command.symbol);
                if(!parsed.success) return;
                let handlers = this.commands.get(parsed.command);
                if(handlers) {
                    logger.debug(`Bot Command: ${msg.content}`);
                    // TODO make the player able to handle multiple channels
                    this.player.channel  = (msg.channel as TextChannel)//recheck important
                //this.player.channel as TextChannel =  msg.channel;
              
               
               
                    handlers.forEach(handle => {
                        handle(parsed, msg);
                    });
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
                logger.debug('Reconnecting...');
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
                .filter(file => !file.includes('.map'))
                .map(file => requireFile('./dist/plugins', file).default)
                .map(construct => new construct());
            this.plugins.forEach(plugin => plugin.preInitialize(this));
            this.plugins.forEach(plugin => plugin.postInitialize(this));
=======
    parsedMessage(msg: SuccessfulParsedMessage<Message>) {
        const handlers = this.commands.get(msg.command);
        if (handlers) {
            this.player.channel = msg.message.channel;
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
        }
    }

    onClientCreated(client: Client): void {
        this.status = new BotStatus(client);
        this.player = new MediaPlayer(this.config, this.status, this.logger);

        client.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
            if (reaction.partial) {
                try {
                    await reaction.fetch();
                } catch (error) {
                    this.logger.debug(error);
                    return;
                }
            }
            if (reaction.message.author.id === this.client.user.id && user.id !== this.client.user.id) {
                if (reaction.message.embeds.length > 0) {
                    const embed = reaction.message.embeds[0];
                    if (embed) {
                        if (reaction.emoji.name === this.config.emojis.addSong && embed.url) {
                            this.logger.debug(`Emoji Click: Adding Media: ${embed.url}`);
                            this.player.addMedia({ type: 'youtube', url: embed.url, requestor: user.username });
                        }
                        if (reaction.emoji.name === this.config.emojis.stopSong) {
                            this.logger.debug('Emoji Click: Stopping Song');
                            this.player.stop();
                        }
                        if (reaction.emoji.name === this.config.emojis.playSong) {
                            this.logger.debug('Emoji Click: Playing/Resuming Song');
                            this.player.play();
                        }
                        if (reaction.emoji.name === this.config.emojis.pauseSong) {
                            this.logger.debug('Emoji Click: Pausing Song');
                            this.player.pause();
                        }
                        if (reaction.emoji.name === this.config.emojis.skipSong) {
                            this.logger.debug('Emoji Click: Skipping Song');
                            this.player.skip();
                        }
                    }
                    reaction.users.remove(user.id);
                }
            }
        })
    }

    onReady(client: Client): void {
        this.player.determineStatus();
        console.log(`Guilds: ${this.client.guilds.cache.keyArray().length}`);
        this.client.guilds.cache.forEach(guild => {
            console.log(`Guild Name: ${guild.name}`);
            const manageMessagesRole = guild.roles.cache.has('MANAGE_MESSAGES');
            console.log(`- Can Manage Messages: ${manageMessagesRole}`);
        });
    }

    onRegisterConsoleCommands(map: CommandMap<(args: ParsedArgs, rl: Interface) => void>): void { }
    
}
