<<<<<<< HEAD

import { ParsedMessage } from 'discord-command-parser';
import { Message, ClientUser } from 'discord.js';
import * as ytdl from 'ytdl-core';
import { secondsToTimestamp, MediaPlayer } from '../bot';
import { IBot, IBotPlugin, MediaItem } from '../resources';
=======
import { IRhythmBotConfig, RhythmBot } from '../bot';
import { MediaItem } from '../media';
import { secondsToTimestamp } from '../helpers';
import { IBotPlugin, IBot, SuccessfulParsedMessage, Message, CommandMap, Client, IBotConfig } from 'discord-bot-quickstart';
import * as ytdl from 'ytdl-core';
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5

const youtubeType: string = 'youtube';

export default class YoutubePlugin extends IBotPlugin {
    bot: RhythmBot;

<<<<<<< HEAD


    preInitialize(bot: IBot): void {
        bot.helptext += '\n` !add youtube:*youtubecode*\n'
        const player = bot.player;
        
        bot.commands.on(youtubeType, (cmd: ParsedMessage, msg: Message) => {
        
=======
    preInitialize(bot: IBot<IRhythmBotConfig>): void {
        this.bot = bot as RhythmBot;
        this.bot.helptext += '\n`youtube [url/idfragment]` - Add youtube audio to the queue\n';
    }

    registerDiscordCommands(map: CommandMap<(cmd: SuccessfulParsedMessage<Message>, msg: Message) => void>) {
        map.on(youtubeType, (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
            if(cmd.arguments.length > 0) {
                cmd.arguments.forEach(arg => {
                    this.bot.player.addMedia({ type: youtubeType, url: arg, requestor: msg.author.username });
                });
            }
        });

        this.bot.player.typeRegistry.set(
            youtubeType,
            {
                getDetails: (item: MediaItem) => new Promise((done, error) => {
<<<<<<< HEAD
                  // item.url = item.url.includes('://') ? item.url : `https://www.youtube.com/watch?v=${item.url}`;
                  
                    let result = ytdl.getInfo(item.url, (err, info) => {
                        if(info) {
                            item.name = info.title ? info.title : 'Unknown';
                            console.log("song length: "+info.length_seconds);
                            item.duration = secondsToTimestamp(parseInt(info.length_seconds) || 0);
=======
                    item.url = item.url.includes('://') ? item.url : `https://www.youtube.com/watch?v=${item.url}`;
                    let result = ytdl.getInfo(item.url)
                        .then(info => {
                            item.name = info.videoDetails.title ? info.videoDetails.title : 'Unknown';
                            item.duration = secondsToTimestamp(parseInt(info.videoDetails.lengthSeconds) || 0);
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
                            done(item);
                        })
                        .catch(err => error(err));
                }),
                getStream: (item: MediaItem) => new Promise((done, error) => {
                    let stream = ytdl(item.url, { filter: 'audioonly', quality: 'highestaudio' });
                    if(stream)
                        done(stream);
                    else
                        error('Unable to get media stream');
                })
            }
        );
    }

    registerConsoleCommands() { }

    clientBound() { }

    postInitialize() { }
    
    onReady() { }

}
