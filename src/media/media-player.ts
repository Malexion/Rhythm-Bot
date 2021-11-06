import { IRhythmBotConfig } from "../bot/bot-config";
import { BotStatus } from "../bot/bot-status";
import { MediaQueue } from "./media-queue";
import { MediaItem } from "./media-item.model";
import { IMediaType } from "./media-type.model";
import { createEmbed, createErrorEmbed, createInfoEmbed } from "../helpers";
import {
  Logger,
  TextChannel,
  DMChannel,
  NewsChannel /*, VoiceConnection, StreamDispatcher */,
  PartialDMChannel,
  ThreadChannel,
} from "discord-bot-quickstart";
import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  demuxProbe,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
} from "@discordjs/voice";
import { Readable } from "stream";

export class MediaPlayer {
  typeRegistry: Map<string, IMediaType> = new Map<string, IMediaType>();
  queue: MediaQueue = new MediaQueue();
  playing: boolean = false;
  paused: boolean = false;
  stopping: boolean = false;
  config: IRhythmBotConfig;
  status: BotStatus;
  logger: Logger;
  channel:
    | PartialDMChannel
    | DMChannel
    | TextChannel
    | NewsChannel
    | ThreadChannel;
  connection?: VoiceConnection;
  dispatcher?: AudioPlayer;
  audioResource: AudioResource;
  isPlaying: Boolean = false;

  constructor(config: IRhythmBotConfig, status: BotStatus, logger: Logger) {
    this.config = config;
    this.status = status;
    this.logger = logger;
    this.dispatcher = createAudioPlayer();
  }

  addMedia(item: MediaItem): Promise<void> {
    return new Promise((done, error) => {
      let type = this.typeRegistry.get(item.type);
      if (type) {
        type
          .getDetails(item)
          .then((media) => {
            item.name = media.name;
            item.duration = media.duration;
            item.description = media.description;
            item.isLive = media.isLive;
            this.queue.enqueue(item);
            done(item);
          })
          .catch((err) => error(err));
      } else error("Unknown Media Type!");
    })
      .then((item: MediaItem) => {
        if (this.channel && item) {
          const embed = createEmbed()
            .setTitle("Track Added")
            .addField("Title:", item.name)
            .addField("Position:", `${this.queue.indexOf(item) + 1}`, true)
            .addField("Requested By", item.requestor, true);
          this.channel.send({ embeds: [embed] });
        }
      })
      .catch((err) => {
        if (this.channel)
          this.channel.send({
            embeds: [createErrorEmbed(`Error adding track: ${err}`)],
          });
      });
  }

  at(idx: number) {
    return this.queue[idx];
  }

  remove(item: MediaItem) {
    if (item == this.queue.first && (this.playing || this.paused)) this.stop();
    this.queue.dequeue(item);
    this.determineStatus();
    if (this.channel)
      this.channel.send({
        embeds: [createInfoEmbed(`Track Removed: ${item.name}`)],
      });
  }

  clear() {
    if (this.playing || this.paused) this.stop();
    this.queue.clear();
    this.determineStatus();
    if (this.channel)
      this.channel.send({ embeds: [createInfoEmbed(`Playlist Cleared!`)] });
  }

  dispatchStream(stream: Readable, item: MediaItem) {
    this.audioResource = createAudioResource(stream, {
      inlineVolume: true,
      inputType: StreamType.WebmOpus,
    });

    if (this.dispatcher) {
      this.dispatcher.stop();
      this.dispatcher = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });
      this.dispatcher.play(this.audioResource);
    }

    this.dispatcher.on(AudioPlayerStatus.Buffering, async () => {
      if (this.channel) {
        const embed = createEmbed()
          .setTitle("▶️ Now Buffering")
          .setDescription(`${item.name}`)
          .addField("Requested By", `${item.requestor}`);
        const msg = await this.channel.send({ embeds: [embed] });
      }
      this.determineStatus();
    });

    this.dispatcher.on(AudioPlayerStatus.Playing, async () => {
      this.playing = true;
      this.determineStatus();
      if (this.channel) {
        const embed = createEmbed()
          .setTitle("▶️ Now playing")
          .setDescription(`${item.name}`)
          .addField("Requested By", `${item.requestor}`);
        const msg = await this.channel.send({ embeds: [embed] });
        msg.react(this.config.emojis.stopSong);
        msg.react(this.config.emojis.playSong);
        msg.react(this.config.emojis.pauseSong);
        msg.react(this.config.emojis.skipSong);
      }
    });
    this.dispatcher.on("debug", (info: string) => {
       this.logger.debug(info);
    });
    this.dispatcher.on("error", (err) => {
      this.skip();
      this.logger.error(err);
      if (this.channel)
        this.channel.send({
          embeds: [createErrorEmbed(`@Miki-> Error Playing Song: ${err}`)],
        });
      process.exit(2);
    });

    this.dispatcher.on(AudioPlayerStatus.Idle, () => {
      this.logger.debug("Stream Finished");
      if (this.dispatcher) {
        this.playing = false;
        if (!this.stopping) {
          let track = this.queue.dequeue();
          if (this.config.queue.repeat) this.queue.enqueue(track);
          setTimeout(() => {
            this.play();
          }, 1000);
        }
        this.stopping = false;
      }
      this.determineStatus();
    });
  }

  async play() {
    if (this.queue.length == 0 && this.channel)
      this.channel.send({
        embeds: [createInfoEmbed(`Queue is empty! Add some songs!`)],
      });

    if (this.playing && !this.paused)
      this.channel.send({
        embeds: [createInfoEmbed(`Already playing a song!`)],
      });

    let item = this.queue.first;
    if (item && this.connection) {
      let type = this.typeRegistry.get(item.type);
      if (type) {
        if (this.dispatcher.state.status == AudioPlayerStatus.Idle) {
          type
            .getStream(item)
            .then((stream) => {
              this.dispatchStream(stream, item);
            })
            .then(() => {
            /*  if (this.isPlaying == false) {
                console.log("subscribe here ----->>.");*/
                this.connection.subscribe(this.dispatcher); //here audioplayer not reusable ?????????????
              /*  this.isPlaying = true;
              }*/
              this.determineStatus();
            });
        } else if (this.paused && this.dispatcher) {
          this.dispatcher.unpause();
          this.paused = false;
          this.determineStatus();
          if (this.channel)
            this.channel.send({
              embeds: [createInfoEmbed(`⏯️ ${this.queue.first.name}resumed`)],
            });
        }
      }
    }
  }

  stop() {
    if (this.playing && this.dispatcher) {
      let item = this.queue.first;
      this.stopping = true;
      this.paused = false;
      this.playing = false;
      this.dispatcher.pause();
      this.dispatcher.stop(true);
      this.determineStatus();
      if (this.channel)
        this.channel.send({
          embeds: [createInfoEmbed(`⏹️ ${item.name} stopped`)],
        });
    }
  }

  skip() {
    if (this.playing && this.dispatcher) {
      let item = this.queue.first;
      this.paused = false;
      this.dispatcher.pause();
      this.dispatcher.stop(true);
      if (this.channel)
        this.channel.send({
          embeds: [createInfoEmbed(`⏭️ ${item.name} skipped`)],
        });
    } else if (this.queue.length > 0) {
      let item = this.queue.first;
      this.queue.dequeue();
      if (this.channel)
        this.channel.send({
          embeds: [createInfoEmbed(`⏭️ ${item.name} skipped`)],
        });
    }
    this.determineStatus();
  }

  pause() {
    if (this.playing && !this.paused && this.dispatcher) {
      this.dispatcher.pause();
      this.paused = true;
      this.determineStatus();
      if (this.channel)
        this.channel.send({
          embeds: [createInfoEmbed(`⏸️ ${this.queue.first.name} paused`)],
        });
    }
  }

  shuffle() {
    if (this.playing || this.paused) this.stop();
    this.queue.shuffle();
    this.determineStatus();
    if (this.channel)
      this.channel.send({ embeds: [createInfoEmbed(`🔀 Queue Shuffled`)] });
  }

  move(currentIdx: number, targetIdx: number) {
    let max = this.queue.length - 1;
    let min = 0;
    currentIdx = Math.min(Math.max(currentIdx, min), max);
    targetIdx = Math.min(Math.max(targetIdx, min), max);

    if (currentIdx != targetIdx) {
      this.queue.move(currentIdx, targetIdx);
      this.determineStatus();
    }
  }

  setVolume(volume: number) {
    volume = Math.min(Math.max(volume / 100 + 0.5, 0.5), 2);
    this.config.stream.volume = volume;
    if (this.dispatcher) {
      this.audioResource.volume.setVolume(volume);
    }
  }

  getVolume() {
    return (this.config.stream.volume - 0.5) * 100 + "%";
  }

  determineStatus() {
    let item = this.queue.first;
    console.log(
      `det sts ${this.queue.length} && state ${this.dispatcher.state.status}`
    );

    if (this.dispatcher.state.status == AudioPlayerStatus.Buffering) {
      this.status.setBanner(`Buffering...`);
    }
    if (this.dispatcher.state.status == AudioPlayerStatus.Idle) {
      if (this.queue.length < 1) this.status.setBanner(`No Songs In Queue`);
    } else if (this.dispatcher.state.status == AudioPlayerStatus.Playing) {
      this.status.setBanner(
        `Now Playing: "${item.name}" Requested by: ${item.requestor}${
          this.queue.length > 1 ? `, Up Next "${this.queue[1].name}"` : ""
        }`
      );
      if (this.paused) {
        this.status.setBanner(
          `Paused: "${item.name}" Requested by: ${item.requestor}`
        );
      }
    }

    if (this.queue.length > 0 && item.isLive) {
      this.status.setBanner(
        `Playing ${item.name} stream Requested by : ${item.requestor}`
      );
    }
  }
}

//in future dev..
async function probeAndCreateResource(readableStream) {
  const { stream, type } = await demuxProbe(readableStream);
  return createAudioResource(stream, { inputType: type });
}
