import { MediaPlayer } from "../media";
import { BotStatus } from "./bot-status";
import { IRhythmBotConfig } from "./bot-config";
import {
  joinUserChannel,
  createInfoEmbed,
  createErrorEmbed,
  secondsToTimestamp,
  createEmbed,
} from "../helpers";
import {
  IBot,
  CommandMap,
  Client,
  ParsedArgs,
  Interface,
  SuccessfulParsedMessage,
  Message,
  readFile,
  MessageReaction,
  User,
} from "discord-bot-quickstart";
import * as yts from "yt-search";
import { AudioPlayerStatus, VoiceConnectionStatus } from "@discordjs/voice";
import { MEDIA_ITEM_TYPE } from "../media/media-type";

const helptext = readFile("../helptext.txt");
const random = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};
const pingPhrases = [`Can't stop won't stop!`, `:ping_pong: Pong Bitch!`];

export class RhythmBot extends IBot<IRhythmBotConfig> {
  helptext: string;
  player: MediaPlayer;
  status: BotStatus;

  constructor(config: IRhythmBotConfig) {
    super(config, <IRhythmBotConfig>{
      auto: {
        deafen: false,
        pause: false,
        play: false,
        reconnect: true,
      },
      discord: {
        log: true,
      },
      command: {
        symbol: "!",
      },
      directory: {
        plugins: "./plugins",
        logs: "../bot.log",
      },
      queue: {
        announce: true,
        repeat: false,
      },
      stream: {
        seek: 0,
        volume: 1,
        bitrate: "auto",
        forwardErrorCorrection: false,
      },
      emojis: {
        addSong: "👍",
        stopSong: "⏹️",
        playSong: "▶️",
        pauseSong: "⏸️",
        skipSong: "⏭️",
      },
    });
    this.helptext = helptext;
  }

  onRegisterDiscordCommands(
    map: CommandMap<
      (cmd: SuccessfulParsedMessage<Message>, msg: Message) => void
    >
  ): void {
    map
      .on("ping", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        let phrases = pingPhrases.slice();
        if (msg.guild)
          phrases = phrases.concat(msg.guild.emojis.cache.map((x) => x.name));
        msg.channel.send(random(phrases));
      })
      .on("help", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        msg.channel.send(this.helptext);
      })
      .on("join", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        joinUserChannel(msg)
          .then((connection) => {
            this.player.connection = connection;
            msg.channel.send({
              embeds: [createInfoEmbed(`Joined Channel: ${msg.guild.name}`)],
            });

          })
          .catch((err) => {
            msg.channel.send({ embeds: [createErrorEmbed(err)] });
          });
      })
      .on("radiozu", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        joinUserChannel(msg)
          .then((connection) => {
            this.player.connection = connection;
            msg.channel.send({
              embeds: [createInfoEmbed(`Joined Channel: ${msg.guild.name}`)],
            });

            this.player
              .addMedia({
                type: MEDIA_ITEM_TYPE.RADIO,
                url: "Radio ZU",
                requestor: msg.author.username,
              })
              .then(() => {
                if (
                  this.player.dispatcher &&
                  !(
                    this.player.dispatcher.state.status ==
                    AudioPlayerStatus.Playing
                  )
                )
                  this.player.play();
              });
          })
          .catch((err) => {
            console.log(err);
            msg.channel.send({ embeds: [createErrorEmbed("Mik, error")] });
          });
      })
      .on(
        "radiovirgin",
        (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
          joinUserChannel(msg)
            .then((connection) => {
              this.player.connection = connection;
              msg.channel.send({
                embeds: [createInfoEmbed(`Joined Channel: ${msg.guild.name}`)],
              });
              this.player
                .addMedia({
                  type: MEDIA_ITEM_TYPE.RADIO,
                  url: "Virgin Radio Romania",
                  requestor: msg.author.username,
                })
                .then(() => {
                  if (
                    this.player.dispatcher &&
                    !(
                      this.player.dispatcher.state.status ==
                      AudioPlayerStatus.Playing
                    )
                  )
                    this.player.play();
                });
            })
            .catch((err) => {
              console.log(err);
              msg.channel.send({ embeds: [createErrorEmbed("Mik, error")] });
            });
        }
      )

      .on("leave", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        if (
          this.player.connection &&
          !(
            this.player.connection.state.status ==
            VoiceConnectionStatus.Disconnected
          )
        )
           this.player.dispatcher.stop();
          this.player.clear();
        this.player.dispatcher.stop(true);
        if (
          !(
            this.player.connection.state.status ==
            VoiceConnectionStatus.Disconnected
          )
        )
          this.player.connection.disconnect();
      })
      .on("desc", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        //if (this.player.playing && this.player.dispatcher) {
        if (
          this.player.dispatcher &&
          this.player.dispatcher.state.status == AudioPlayerStatus.Playing
        ) {
          msg.channel.send({
            embeds: [
              createInfoEmbed(
                `Description:`,
                `${this.player.queue.first.description}`
              ),
            ],
          });
        }
      })
      .on("play", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        new Promise<void>((done) => {
          // if(this.player.dispatcher){
          joinUserChannel(msg).then((conn) => {
            this.player.connection = conn;
            /* msg.channel.send({
                embeds: [createInfoEmbed(`Joined Channel: ${msg.guild.name}`)],
              });*/
            done();
          }); /* done();*/
          /*}else*/
        }).then(() => {
          if (
            cmd.body.match("^(http(s)://)?((w){3}.)?youtu(be|.be)?(.com)?/.+")
          ) {
            this.player
              .addMedia({
                type: MEDIA_ITEM_TYPE.YOUTUBE,
                url: cmd.body,
                requestor: msg.author.username,
              })
              .then(() => {
                if (
                  this.player.dispatcher &&
                  !(
                    this.player.dispatcher.state.status ==
                    AudioPlayerStatus.Playing
                  )
                )
                  this.player.play();
              });
          } else if (
            cmd.body.length > 0 &&
            !cmd.body.match("^(http(s)://)?((w){3}.)?youtu(be|.be)?(.com)?/.+")
          ) {
            yts(
              {
                query: cmd.body,
                pages: 1,
              },
              (err, result) => {
                result.videos.slice(0, 1).forEach((v, idx) => {
                  const embed = createEmbed()
                    .setTitle(`${v.title}`)
                    .addField("Author:", `${v.author.name}`, true)
                    .addField("Duration", `${v.timestamp}`, true)
                    .setThumbnail(v.image)
                    .setURL(v.url);
                  msg.channel.send({ embeds: [embed] }).then(() => {
                    this.player
                      .addMedia({
                        type: MEDIA_ITEM_TYPE.YOUTUBE,
                        url: v.url,
                        requestor: msg.author.username,
                      })
                      .then(() => {
                        if (
                          this.player.dispatcher &&
                          !(
                            this.player.dispatcher.state.status ==
                            AudioPlayerStatus.Playing
                          )
                        )
                          this.player.play();
                      });
                  });
                });
              }
            );
          } else this.player.play();
        });
      })
      .on("pause", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        this.player.pause();
      })
      .on("time", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        let media = this.player.queue.first;
        if (
          this.player.dispatcher &&
          this.player.dispatcher.state.status == AudioPlayerStatus.Playing
        ) {
          let elapsed = secondsToTimestamp(
            this.player.audioResource.playbackDuration / 1000
          );

          msg.channel.send({
            embeds: [
              createInfoEmbed(`Time Elapsed`, `${elapsed} / ${media.duration}`),
            ],
          });
        } else if (this.player.queue.first) {
          msg.channel.send({
            embeds: [
              createInfoEmbed(`Time Elapsed`, `00.00.00 / ${media.duration}`),
            ],
          });
        }
      })
      //updated from original commit  = 44d41f46f70dfd6effc21d7ae49b23a81453773
      .on(
        "search",
        async (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
          new Promise<void>((done) => {
            if (!this.player.connection) {
              joinUserChannel(msg).then((conn) => {
                this.player.connection = conn;
                msg.channel.send({
                  embeds: [
                    createInfoEmbed(`Joined Channel: ${msg.guild.name}`),
                  ],
                });
                done();
              });
            } else done();
          }).then(async () => {
            let noResults = false;

            if (cmd.body != null && cmd.body !== "") {
              const videos = await yts({ query: cmd.body, pages: 1 }).then(
                (res) => res.videos
              );
              if (videos != null && videos.length > 0) {
                await Promise.all(
                  videos.slice(0, 3).map((video) => {
                    const embed = createEmbed()
                      .setTitle(`${video.title}`)
                      .addField("Author:", `${video.author.name}`, true)
                      .addField("Duration", `${video.timestamp}`, true)
                      .setThumbnail(video.image)
                      .setURL(video.url);
                    msg.channel
                      .send({ embeds: [embed] })
                      .then((m) => m.react(this.config.emojis.addSong));
                  })
                );
              } else {
                noResults = true;
              }
            } else {
              noResults = true;
            }

            if (noResults) {
              msg.channel.send({
                embeds: [
                  createErrorEmbed(
                    `No songs found OR No search string provided`
                  ),
                ],
              });
            }
          });
        }
      )
      .on(
        "add",
        async (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
          if (cmd.arguments.length > 0) {
            cmd.arguments.forEach((arg) => {
              let items = this.player.queue;
              if (
                arg.match("^(http(s)://)?((w){3}.)?youtu(be|.be)?(.com)?/.+")
              ) {
                if (items.length <= 1) {
                  this.player
                    .addMedia({
                      type: MEDIA_ITEM_TYPE.YOUTUBE,
                      url: arg,
                      requestor: msg.author.username,
                    })
                    .then(() => {
                      if (
                        this.player.dispatcher &&
                        !(
                          this.player.dispatcher.state.status ==
                          AudioPlayerStatus.Playing
                        )
                      )
                        this.player.play();
                    });
                } else {
                  this.player.addMedia({
                    type: MEDIA_ITEM_TYPE.YOUTUBE,
                    url: arg,
                    requestor: msg.author.username,
                  });
                }
              } else
                msg.channel.send({
                  embeds: [createErrorEmbed(`Invalid media type format`)],
                });
            });
          }
        }
      )
      .on("remove", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        if (cmd.arguments.length > 0) {
          let idx = parseInt(cmd.arguments[0]);
          let item = this.player.at(idx - 1);
          if (item) {
            this.player.remove(item);
          }
        }
      })
      .on("skip", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        this.player.skip();
      })
      .on("stop", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        this.player.stop();
      })
      .on("list", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        let items = this.player.queue.map(
          (item, idx) =>
            `${idx + 1}. Type: "${item.type}", Title: "${item.name}${
              item.requestor ? `", Requested By: ${item.requestor}` : ""
            }"`
        );
        if (items.length > 0)
          msg.channel.send({
            embeds: [
              createInfoEmbed("Current Playing Queue", items.join("\n\n")),
            ],
          });
        else
          msg.channel.send({
            embeds: [createInfoEmbed(`There are no songs in the queue.`)],
          });
      })
      .on("clear", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        this.player.clear();
      })
      .on("move", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        if (cmd.arguments.length > 1) {
          let current = Math.min(
              Math.max(parseInt(cmd.arguments[0]), 0),
              this.player.queue.length - 1
            ),
            targetDesc = cmd.arguments[0],
            target = 0;
          if (targetDesc == "up") target = Math.min(current - 1, 0);
          else if (targetDesc == "down")
            target = Math.max(current + 1, this.player.queue.length - 1);
          else target = parseInt(targetDesc);

          this.player.move(current, target);
        }
      })
      .on("shuffle", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        this.player.shuffle();
      })
      .on("volume", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        if (cmd.arguments.length > 0) {
          let temp = cmd.arguments[0];
          if (temp) {
            let volume = Math.min(Math.max(parseInt(temp), 0), 100);
            this.player.setVolume(volume);
          }
        }
        msg.channel.send({
          embeds: [createInfoEmbed(`Volume is at ${this.player.getVolume()}`)],
        });
      })
      .on("repeat", (cmd: SuccessfulParsedMessage<Message>, msg: Message) => {
        this.config.queue.repeat = !this.config.queue.repeat;
        msg.channel.send({
          embeds: [
            createInfoEmbed(
              `Repeat mode is ${this.config.queue.repeat ? "on" : "off"}`
            ),
          ],
        });
      });
  }
  //unused maybe it will be usefull in the future
  parsedMessage(msg: SuccessfulParsedMessage<Message>) {
    const handlers = this.commands.get(msg.command);
    if (!(msg.message.channel.type == "DM")) {
      if (handlers) {
        this.player.channel = msg.message.channel;
      }
    } else {
      msg.message.reply({
        embeds: [createInfoEmbed(`This bot doesn't take commands from PMs!`)],
      });
    }
  }

  onClientCreated(client: Client): void {
    this.status = new BotStatus(client);
    this.player = new MediaPlayer(this.config, this.status, this.logger);

    client.on(
      "messageReactionAdd",
      async (reaction: MessageReaction, user: User) => {
        if (reaction.partial) {
          try {
            await reaction.fetch();
          } catch (error) {
            this.logger.debug(error);
            return;
          }
        }
        if (
          reaction.message.author.id === this.client.user.id &&
          user.id !== this.client.user.id
        ) {
          if (reaction.message.embeds.length > 0) {
            const embed = reaction.message.embeds[0];
            if (embed) {
              if (
                reaction.emoji.name === this.config.emojis.addSong &&
                embed.url
              ) {
                this.logger.debug(`Emoji Click: Adding Media: ${embed.url}`);
                this.player.addMedia({
                  type: MEDIA_ITEM_TYPE.YOUTUBE,
                  url: embed.url,
                  requestor: user.username,
                });
              }
              if (reaction.emoji.name === this.config.emojis.stopSong) {
                this.logger.debug("Emoji Click: Stopping Song");
                this.player.stop();
              }
              if (reaction.emoji.name === this.config.emojis.playSong) {
                this.logger.debug("Emoji Click: Playing/Resuming Song");
                this.player.play();
              }
              if (reaction.emoji.name === this.config.emojis.pauseSong) {
                this.logger.debug("Emoji Click: Pausing Song");
                this.player.pause();
              }
              if (reaction.emoji.name === this.config.emojis.skipSong) {
                this.logger.debug("Emoji Click: Skipping Song");
                this.player.skip();
              }
            }
            reaction.users.remove(user.id);
          }
        }
      }
    );
    //stackoverflow solution !
    client.on("voiceStateUpdate", (oldState, newState) => {
      // if nobody left the channel in question, return.
      if (
        oldState.channelId !== oldState.guild.me.voice.channelId ||
        newState.channel
      )
        return;

      // otherwise, check how many people are in the channel now
      if (oldState.channel.members.size < 2)
        setTimeout(() => {
          // if 1 (you), wait five minutes
          if (oldState.channel.members.size < 2)
            // if there's still 1 member,
            //  this.player.skip();
            this.player.dispatcher.stop(true);
          this.player.clear();
          this.player.connection.disconnect();
          this.status.setBanner(`No Songs In Queue`);
        }, 30000); // (3 min in ms)
    });
  }

  onReady(client: Client): void {
    console.log(`Guilds: ${this.client.guilds.cache.size}`);
    this.client.guilds.cache.forEach((guild) => {
      console.log(`\nGuild Name: ${guild.name}`);

      const channels = guild.channels.cache
        .filter(
          (x) =>
            x.isText() &&
            x.permissionsFor(this.client.user).has("MANAGE_MESSAGES")
        )
        .map((x) => x.name);

      if (channels && channels.length > 0) {
        console.log(
          `Can manage message in these channels \n${channels.join("\n")}`
        );
      } else {
        console.log("Unable to manage messages on this guild");
      }
    });
    this.status.setBanner(`No Songs In Queue`);
  }

  onRegisterConsoleCommands(
    map: CommandMap<(args: ParsedArgs, rl: Interface) => void>
  ): void {}
}
