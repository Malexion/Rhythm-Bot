import { IRhythmBotConfig, RhythmBot } from "../bot";
import { MediaItem } from "../media";
import { secondsToTimestamp } from "../helpers";
import {
  IBotPlugin,
  IBot,
  SuccessfulParsedMessage,
  Message,
  CommandMap,
  Client,
  IBotConfig,
} from "discord-bot-quickstart";
import { Readable } from "stream";
import * as ytdl from "ytdl-core";
import * as ytpl from "ytpl";

const youtubeType: string = "youtube";

const cookie: string =
  "LOGI_INFO=AFmmF2swRAIgLw7aQC5MpW5f-J3k9J38ul2jhpPHjZlneUbTZ5thhooCIFbQCu84vKalHaf4FMtBGUj9CxRrmBb18CJ4xLIC8ywi:QUQ3MjNmeDhxUXp3MkRPZVdsbEhsWkZsTHVoWGtXa1JZNVRYb3JqV2dwck9wcERhTmFFVFhBLXp5SDh0NWR0N1BLTGFseFhrZ3hwNGd6ZURqcG9WYTN2OUpFZXlpYTdLUHB6Q0NmaER3VVFmaDh0c1JfODEtWURXYUphRjFYYUJJdExvRmcyZFNPc1JBZ0JTcXpzU3ozTzVvcGJ2SC1vSGtn; HSID=Aa3qWcushVQ9benXP; SID=FAgGb1ZvwAfBSg6OehJeTzpwIzLO4Mw-3SiTL4LSm7WZ3VpGUPwMuKS55xgKIsYTxdyseQ; SSID=A7Gq7xRk2VK-BRLdh";
export default class YoutubePlugin extends IBotPlugin {
  bot: RhythmBot;

  preInitialize(bot: IBot<IRhythmBotConfig>): void {
    this.bot = bot as RhythmBot;
    this.bot.helptext +=
      "\n`youtube [url/idfragment]` - Add youtube audio to the queue\n";
    this.bot.helptext += "\n` !add youtube:*youtubecode*\n";
  }

  registerDiscordCommands(
    map: CommandMap<
      (cmd: SuccessfulParsedMessage<Message>, msg: Message) => void
    >
  ) {
    map.on(
      youtubeType,
      (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        if (cmd.arguments.length > 0) {
          cmd.arguments.forEach((arg) => {
            this.bot.player.addMedia({
              type: youtubeType,
              url: arg,
              requestor: msg.author.username,
            });
          });
        }
      }
    );

    this.bot.player.typeRegistry.set(youtubeType, {
      getPlaylist: (item: MediaItem) =>
        new Promise<MediaItem[]>((done, error) => {
          ytpl(item.url)
            .then((playlist) => {
              const items = playlist.items.map(
                (item) =>
                  <MediaItem>{
                    type: youtubeType,
                    url: item.url,
                    name: item.title,
                  }
              );
              done(items);
            })
            .catch((err) => error(err));
        }),

      getDetails: (item: MediaItem) =>
        new Promise<MediaItem>((done, error) => {
          ytdl
            .getInfo(item.url)
            .then((info) => {
              item.name = info.videoDetails.title
                ? info.videoDetails.title
                : "Unknown";
              item.duration = secondsToTimestamp(
                parseInt(info.videoDetails.lengthSeconds) || 0
              );
              item.description = info.videoDetails.description
                ? info.videoDetails.description
                : "No description available!";
              item.isLive = info.videoDetails.isLiveContent
                ? info.videoDetails.isLiveContent
                : false;
              /*   info.formats.forEach(element => { // ex-live videos won't work !!!
                               if(element.){
                               console.log(element.quality);
                               console.log(element.codecs);
                               console.log(element.container);
                               console.log("--------------------------------------")
                               }
                           });
                         */

              done(item);
            })
            .catch((err) => error(err));
        }),
      getStream: (item: MediaItem) =>
        new Promise<Readable>((done, error) => {
          let stream = ytdl(item.url, {
            quality: "highestaudio",
            requestOptions: {
              headers: {
                Cookie: cookie,
              },
            },
            filter: item.isLive
              ? (format) => format.isHLS === true
              : (format) =>
                  format.container === "webm" && format.codecs === "opus",
            highWaterMark: 1 << 28,
            liveBuffer: 4999,
            dlChunkSize: 1 << 12,
          });

          if (stream) done(stream);
          else error("Unable to get media stream");
        }),
    });
  }

  registerConsoleCommands() {}

  clientBound() {}

  postInitialize() {}

  onReady() {}
}
