import { IRhythmBotConfig } from "../bot/bot-config";
import { BotStatus } from "../bot/bot-status";
import { MediaQueue } from "./media-queue";
import { MediaItem } from "./media-item.model";
import { IMediaType } from "./media-type.model";
import * as child_process from "child_process";
import { createEmbed, createErrorEmbed, createInfoEmbed } from "../helpers";
import {
  Logger,
  TextChannel,
  DMChannel,
  NewsChannel,
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
import { MEDIA_ITEM_TYPE } from "./media-type";

export class MediaPlayer {
  typeRegistry: Map<string, IMediaType> = new Map<string, IMediaType>();
  queue: MediaQueue = new MediaQueue();
  config: IRhythmBotConfig;
  status: BotStatus;
  logger: Logger;
  isRadio: Boolean = false;
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
    this.dispatcher = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
  }

  addMedia(item: MediaItem): Promise<void> {
    return new Promise((done, error) => {
      let type = this.typeRegistry.get(item.type);
      if (type && item.type == MEDIA_ITEM_TYPE.YOUTUBE) {
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
      } else if (item.type == MEDIA_ITEM_TYPE.RADIO) {
        item.name = item.url;
        item.duration = "Live";
        item.isLive = true;
        item.description = "Live Radio Stream !";
        this.queue.enqueue(item);
        done(item);
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
    if (
      item == this.queue.first &&
      (this.dispatcher.state.status == AudioPlayerStatus.Playing ||
        this.dispatcher.state.status == AudioPlayerStatus.Paused)
    )
      this.stop();
    this.queue.dequeue(item);
    if (this.channel)
      this.channel.send({
        embeds: [createInfoEmbed(`Track Removed: ${item.name}`)],
      });
  }

  clear() {
    if (
      this.dispatcher.state.status == AudioPlayerStatus.Playing ||
      this.dispatcher.state.status == AudioPlayerStatus.Paused
    )
      this.stop();
    this.queue.clear();
    this.status.setBanner(`No Songs In Queue`);
    if (this.channel)
      this.channel.send({ embeds: [createInfoEmbed(`Playlist Cleared!`)] });
  }

  dispatchStream(stream: Readable, item: MediaItem) {
    if (item.type == MEDIA_ITEM_TYPE.YOUTUBE)
      this.audioResource = createAudioResource(stream, {
        inlineVolume: true,
        //   inputType: StreamType.WebmOpus,
        inputType: StreamType.WebmOpus,
      });

    if (this.dispatcher) {
      this.dispatcher.stop();
      this.dispatcher = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Stop,
        },
      });
    }

    this.dispatcher.on(AudioPlayerStatus.Buffering, async () => {
      if (this.channel) {
        const embed = createEmbed()
          .setTitle("▶️ Now Buffering")
          .setDescription(`${item.name}`)
          .addField("Requested By", `${item.requestor}`);
        const msg = await this.channel.send({ embeds: [embed] });
      }
    });

    this.dispatcher.on(AudioPlayerStatus.Playing, async () => {
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
        this.determineStatus(); 
      }
    });
    this.dispatcher.on("debug", (info: string) => {
      //  this.logger.debug(info);
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

    this.dispatcher.on("stateChange", (oldState, newState) => {
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status != AudioPlayerStatus.Idle
      ) {
        this.dispatcher.stop(true);
        this.audioResource = null;
        let track = this.queue.dequeue();
        //this.play();

        if (this.config.queue.repeat) this.queue.enqueue(track);
        setTimeout(() => {
          this.play();
        }, 1000);
      }
      this.determineStatus(); //main
    });

    this.connection.subscribe(this.dispatcher);

    this.dispatcher.on(AudioPlayerStatus.Idle, async () => {
      this.logger.debug("Stream Finished");
      //this.determineStatus();//2
    });
  }

  play() {
    if (this.queue.length == 0 && this.channel)
      this.channel.send({
        embeds: [createInfoEmbed(`Queue is empty! Add some songs!`)],
      });

    if (
      this.dispatcher &&
      this.dispatcher.state.status == AudioPlayerStatus.AutoPaused
    )
      this.dispatcher.unpause();

    if (
      this.dispatcher &&
      this.dispatcher.state.status == AudioPlayerStatus.Playing
    )
      this.channel.send({
        embeds: [createInfoEmbed(`Already playing a song!`)],
      });

    let item = this.queue.first;
    if (item && this.connection) {
      let type = this.typeRegistry.get(item.type);
      if (type && item.type == MEDIA_ITEM_TYPE.YOUTUBE) {
        if (this.dispatcher.state.status == AudioPlayerStatus.Idle) {
          type.getStream(item).then((stream) => {
            this.dispatchStream(stream, item);
            this.dispatcher.play(this.audioResource);
          });
        } else if (
          this.dispatcher &&
          this.dispatcher.state.status == AudioPlayerStatus.Paused
        ) {
          this.dispatcher.unpause();
          if (this.channel)
            this.channel.send({
              embeds: [createInfoEmbed(`⏯️ ${this.queue.first.name}resumed`)],
            });
        }
      } else if (item.type == MEDIA_ITEM_TYPE.RADIO) {
        if (item.name.includes("ZU")) {
          const ffmpeg = child_process.spawn("ffmpeg", [
            "-analyzeduration",
            "0",
            "-loglevel",
            "0",
            "-i",
            "http://live4ro.antenaplay.ro//radiozu/radiozu-48000.m3u8",
            "-f",
            "opus",
            "pipe:1",
          ]);

          this.dispatchStream(ffmpeg.stdout, item);
          this.dispatcher.play(createAudioResource(ffmpeg.stdout));
          this.isRadio = true;
        } else if (item.name.includes("Virgin")) {
          const ffmpeg = child_process.spawn("ffmpeg", [
            "-analyzeduration",
            "0",
            "-loglevel",
            "0",
            "-i",
            "http://astreaming.virginradio.ro:8000/virgin_aacp_64k",
            "-f",
            "adts",
            "pipe:1",
          ]);
          this.dispatchStream(ffmpeg.stdout, item);
          this.dispatcher.play(createAudioResource(ffmpeg.stdout));
          //  this.dispatcher.play(createAudioResource(ffmpeg.stdout));
          this.isRadio = true;
        }
      }
    }
  }

  playRadioVirgin() {
    if (
      this.dispatcher &&
      this.dispatcher.state.status == AudioPlayerStatus.Playing
    )
      this.channel.send({
        embeds: [createInfoEmbed(`Already playing a song!`)],
      });
    if (this.dispatcher.state.status == AudioPlayerStatus.Idle) {
      const ffmpeg = child_process.spawn("ffmpeg", [
        "-analyzeduration",
        "0",
        "-loglevel",
        "0",
        "-i",
        "http://astreaming.virginradio.ro:8000/virgin_aacp_64k",
        "-f",
        "adts",
        "pipe:1",
      ]);

      this.dispatcher.play(createAudioResource(ffmpeg.stdout));
      //   this.connection.subscribe(this.dispatcher);
      this.isRadio = true;
    }
  }

  playRadioZU() {
    if (
      this.dispatcher &&
      this.dispatcher.state.status == AudioPlayerStatus.Playing
    )
      this.channel.send({
        embeds: [createInfoEmbed(`Already playing a song!`)],
      });
    if (this.dispatcher.state.status == AudioPlayerStatus.Idle) {
      const ffmpeg = child_process.spawn("ffmpeg", [
        "-analyzeduration",
        "0",
        "-loglevel",
        "0",
        "-i",
        "http://live4ro.antenaplay.ro//radiozu/radiozu-48000.m3u8",
        "-f",
        "opus",
        "pipe:1",
      ]);

      this.dispatcher.play(createAudioResource(ffmpeg.stdout));
      // this.connection.subscribe(this.dispatcher);
      this.isRadio = true;
    }
  }

  stop() {
    if (
      this.dispatcher &&
      this.dispatcher.state.status == AudioPlayerStatus.Playing
    ) {
      let item = this.queue.first;
      this.dispatcher.pause();
      this.dispatcher.stop(true);
      if (this.channel)
        this.channel.send({
          embeds: [createInfoEmbed(`⏹️ ${item.name} stopped`)],
        });
    }
  }

  skip() {
    if (this.isRadio == true) {
      this.isRadio = false;
      this.dispatcher.stop(true);
    } else {
      if (
        this.dispatcher &&
        this.dispatcher.state.status == AudioPlayerStatus.Playing
      ) {
        let item = this.queue.first;

        // this.dispatcher.pause();

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
    }
    this.determineStatus();
  }

  pause() {
    if (
      this.dispatcher &&
      this.dispatcher.state.status == AudioPlayerStatus.Playing
    ) {
      this.dispatcher.pause();
      if (this.channel)
        this.channel.send({
          embeds: [createInfoEmbed(`⏸️ ${this.queue.first.name} paused`)],
        });
    }
  }

  shuffle() {
    if (
      this.dispatcher &&
      (this.dispatcher.state.status == AudioPlayerStatus.Playing ||
        this.dispatcher.state.status == AudioPlayerStatus.Paused ||
        this.dispatcher.state.status == AudioPlayerStatus.AutoPaused)
    )
      this.stop();
    this.queue.shuffle();
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
    console.log(`${this.dispatcher.state.status}`);
    if (this.dispatcher && this.isRadio == false) {
      if (this.dispatcher.state.status == AudioPlayerStatus.Buffering) {
        this.status.setBanner(`Buffering...`);
      }
      if (this.dispatcher.state.status == AudioPlayerStatus.Idle) {
        if (this.queue.length <= 0) this.status.setBanner(`No Songs In Queue`);
      }

      if (this.dispatcher.state.status == AudioPlayerStatus.Paused) {
        this.status.setBanner(
          `Paused: "${item.name}" Requested by: ${item.requestor}`
        );
      }
      if (this.dispatcher.state.status == AudioPlayerStatus.AutoPaused) {
        this.status.setBanner(`Auto Paused: "${item.name}"`);
      }
      if (
        this.dispatcher.state.status == AudioPlayerStatus.Idle &&
        this.queue.length > 0
      ) {
        this.status.setBanner(
          `Playing Next: "${item.name}" Requested by: ${item.requestor}`
        );
      }

      if (this.dispatcher.state.status == AudioPlayerStatus.Playing) {
        this.status.setBanner(
          `Now Playing: "${item.name}" Requested by: ${item.requestor}${
            this.queue.length > 1 ? `, Up Next "${this.queue[1].name}"` : ""
          }`
        );
      }

      if (this.queue.length > 0 && item.isLive) {
        this.status.setBanner(
          `Playing ${item.name} stream Requested by : ${item.requestor}`
        );
      }
    } else {
      if (this.queue.length > 0) {
        this.status.setBanner(
          `Playing? ${item.name} stream Requested by : ${item.requestor}`
        );
      }
      if (this.isRadio) {
        if (this.dispatcher.state.status == AudioPlayerStatus.Playing)
          this.status.setBanner(`Playing ${item.name}`);
      }
    }
  }
}

//in future dev..
async function probeAndCreateResource(readableStream) {
  const { stream, type } = await demuxProbe(readableStream);
  return createAudioResource(stream, { inputType: type });
}
