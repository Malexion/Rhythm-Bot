import { IRhythmBotConfig, RhythmBot } from '../bot';
import { MediaItem } from '../media';
import { secondsToTimestamp } from '../helpers';
import { IBotPlugin, IBot, SuccessfulParsedMessage, Message, CommandMap, Client, IBotConfig } from 'discord-bot-quickstart';
import * as ytdl from 'ytdl-core';

const youtubeType: string = 'youtube';

export default class YoutubePlugin extends IBotPlugin {
    bot: RhythmBot;

    preInitialize(bot: IBot<IRhythmBotConfig>): void {
        this.bot = bot as RhythmBot;
        this.bot.helptext += '\n`youtube [url/idfragment]` - Add youtube audio to the queue\n';
    }

    registerDiscordCommands(map: CommandMap<(cmd: SuccessfulParsedMessage<Message>, msg: Message) => void>) {
        map.on(youtubeType, (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
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
                    item.url = item.url.includes('://') ? item.url : `https://www.youtube.com/watch?v=${item.url}`;
                    let result = ytdl.getInfo(item.url)
                        .then(info => {
                            item.name = info.videoDetails.title ? info.videoDetails.title : 'Unknown';
                            item.duration = secondsToTimestamp(parseInt(info.videoDetails.lengthSeconds) || 0);
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
