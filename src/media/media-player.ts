import { IRhythmBotConfig } from '../bot/bot-config';
import { BotStatus } from '../bot/bot-status';
import { MediaQueue } from './media-queue';
import { MediaItem } from './media-item.model';
import { IMediaType } from './media-type.model';
import { createEmbed, createErrorEmbed, createInfoEmbed } from '../helpers';
import { Logger, TextChannel, DMChannel, NewsChannel, VoiceConnection, StreamDispatcher } from 'discord-bot-quickstart';
import { Readable } from 'stream';

export class MediaPlayer {
    typeRegistry: Map<string, IMediaType> = new Map<string, IMediaType>();
    queue: MediaQueue = new MediaQueue();
    playing: boolean = false;
    paused: boolean = false;
    stopping: boolean = false;
    config: IRhythmBotConfig;
    status: BotStatus;
    logger: Logger;
    channel: TextChannel | DMChannel | NewsChannel;
    connection?: VoiceConnection;
    dispatcher?: StreamDispatcher;

    constructor(config: IRhythmBotConfig, status: BotStatus, logger: Logger) {
        this.config = config;
        this.status = status;
        this.logger = logger;
    }

    addMedia(item: MediaItem): Promise<void> {
        return new Promise((done, error) => {
            let type = this.typeRegistry.get(item.type);
            if(type) {
                type.getDetails(item)
                    .then((media) => {
                        item.name = media.name;
                        item.duration = media.duration;
                        this.determineStatus();
                        this.queue.enqueue(item);
                        done(item);
                    })
                    .catch(err => error(err));
            } else
                error('Unknown Media Type!');
        })
        .then((item: MediaItem) => {
            if(this.channel && item)
                this.channel.send({embed:
                    createEmbed()
                        .setTitle('Track Added')
                        .addFields(
                            { name: 'Title:', value: item.name },
                            { name: 'Position:', value: `${this.queue.indexOf(item) + 1}`, inline: true },
                            { name: 'Requested By:', value: item.requestor, inline: true }
                        )
         } );
        })
        .catch(err => {
            if(this.channel)
                this.channel.send({embed: createErrorEmbed(`Error adding track: ${err}`)});
        });
    }

    at(idx: number) {
        return this.queue[idx];
    }

    remove(item: MediaItem) {
        if(item == this.queue.first && (this.playing || this.paused))
            this.stop();
        this.queue.dequeue(item);
        this.determineStatus();
        if(this.channel)
            this.channel.send({embed: createInfoEmbed(`Track Removed: ${item.name}`)});
    }

    clear() {
        if(this.playing || this.paused)
            this.stop();
        this.queue.clear();
        this.determineStatus();
        if(this.channel)
            this.channel.send({embed: createInfoEmbed(`Playlist Cleared!`)});
         
    }

    dispatchStream(stream: Readable, item: MediaItem) {
        if(this.dispatcher) {
            this.dispatcher.end();
            this.dispatcher = null;
        }
        this.dispatcher = this.connection.play(stream, {
            seek: this.config.stream.seek,
            volume: this.config.stream.volume,
            bitrate: this.config.stream.bitrate,
            fec: this.config.stream.forwardErrorCorrection,
            plp: this.config.stream.packetLossPercentage,
           highWaterMark: 1 << 28
        });
        this.dispatcher.on('start', async () => {
            this.playing = true;
            this.determineStatus();
            if(this.channel) {
                const msg = await this.channel.send({embed:
                    createEmbed()
                        .setTitle('▶️ Now playing')
                        .setDescription(`${item.name}`)
                        .addField('Requested By', `${item.requestor}`)
                });
                msg.react(this.config.emojis.stopSong);
                msg.react(this.config.emojis.playSong);
                msg.react(this.config.emojis.pauseSong);
                msg.react(this.config.emojis.skipSong);
            }
        });
        this.dispatcher.on('debug', (info: string) => {
            this.logger.debug(info);
        });
        this.dispatcher.on('error', err => {
            this.skip();
            this.logger.error(err);
            if(this.channel)
                this.channel.send({embed:createErrorEmbed(`@Miki-> Error Playing Song: ${err}`)});
                    process.exit(2);
        });
        this.dispatcher.on('close', () => {
            this.logger.debug(`Stream Closed`);
            if (this.dispatcher) {
                this.playing = false;
                this.dispatcher = null;
              //  this.determineStatus();
                if(!this.stopping) {
                    let track = this.queue.dequeue();
                    if(this.config.queue.repeat)
                        this.queue.enqueue(track);
                        setTimeout(() => {
                            this.play();
                        }, 1000);
                }
                this.stopping = false;
            }
            this.determineStatus();
        });
        this.dispatcher.on('finish', () => {
            this.logger.debug('Stream Finished');
            if (this.dispatcher) {
                this.playing = false;
                this.dispatcher = null;
                this.determineStatus();
                if(!this.stopping) {
                    let track = this.queue.dequeue();
                    if(this.config.queue.repeat)
                        this.queue.enqueue(track);
                        setTimeout(() => {
                            this.play();
                        }, 1000);
                }
                this.stopping = false;
            }
        });
        this.dispatcher.on('end', (reason: string) => {
            this.logger.debug(`Stream Ended: ${reason}`);
            this.determineStatus();
        });
    }

    play() {
        if(this.queue.length == 0 && this.channel)
            this.channel.send({embed: createInfoEmbed(`Queue is empty! Add some songs!`)});
          
        if(this.playing && !this.paused)
            this.channel.send({embed: createInfoEmbed(`Already playing a song!`)});
           
        let item = this.queue.first;
        if(item && this.connection) {
            let type = this.typeRegistry.get(item.type);
            if(type) {
                if(!this.playing) {
                    type.getStream(item)
                        .then(stream => {
                            this.dispatchStream(stream, item);
                        });
                } else if(this.paused && this.dispatcher) {
                    this.dispatcher.resume();
                    this.paused = false;
                    this.determineStatus();
                    if(this.channel)
                        this.channel.send({embed: createInfoEmbed(`⏯️ ${this.queue.first.name}resumed`)});
                       
                }
            }
        }
    }

    stop() {
        if(this.playing && this.dispatcher) {
            let item = this.queue.first;
            this.stopping = true;
            this.paused = false;
            this.playing = false;
            this.dispatcher.pause();
            this.dispatcher.destroy();
            this.determineStatus();
            if(this.channel)
                this.channel.send({embed: createInfoEmbed(`⏹️ ${item.name} stopped`)});
            
        }
    }

    skip() {
        if(this.playing && this.dispatcher) {
            let item = this.queue.first;
            this.paused = false;
            this.dispatcher.pause();
            this.dispatcher.destroy();
            if(this.channel)
                this.channel.send({embed : createInfoEmbed(`⏭️ ${item.name} skipped`)});
              
        } else if(this.queue.length > 0) {
            let item = this.queue.first;
            this.queue.dequeue();
            if(this.channel)
                this.channel.send({embed: createInfoEmbed(`⏭️ ${item.name} skipped`)});
              
        }
        this.determineStatus();
    }

    pause() {
        if(this.playing && !this.paused && this.dispatcher) {
            this.dispatcher.pause();
            this.paused = true;
            this.determineStatus();
            if(this.channel)
               this.channel.send({embed: createInfoEmbed(`⏸️ ${this.queue.first.name} paused`)});
            
        }
    }

    shuffle() {
        if(this.playing || this.paused)
            this.stop();
        this.queue.shuffle();
        this.determineStatus();
        if(this.channel)
            this.channel.send({embed: createInfoEmbed(`🔀 Queue Shuffled`)});
        
    }

    move(currentIdx: number, targetIdx: number) {
        let max = this.queue.length - 1;
        let min = 0;
        currentIdx = Math.min(Math.max(currentIdx, min), max);
        targetIdx = Math.min(Math.max(targetIdx, min), max);

        if(currentIdx != targetIdx) {
            this.queue.move(currentIdx, targetIdx);
            this.determineStatus();
        }
    }

    setVolume(volume: number) {
        volume = Math.min(Math.max((volume / 100) + 0.5, 0.5), 2);
        this.config.stream.volume = volume;
        if(this.dispatcher) {
            this.dispatcher.setVolume(volume);
        }
    }

    getVolume() {
        return ((this.config.stream.volume - 0.5) * 100) + '%';
    }

    determineStatus() {
        let item = this.queue.first;
        if(item) {
            if(this.playing) {
                if(this.paused) {
                    this.status.setBanner(`Paused: "${item.name}" Requested by: ${item.requestor}`);
                } else {
                    this.status.setBanner(`Now Playing: "${item.name}" Requested by: ${item.requestor}${this.queue.length > 1 ? `, Up Next "${this.queue[1].name}"`:''}`);
                }
            } else
                this.status.setBanner(`Up Next: "${item.name}" Requested by: ${item.requestor}`);
        } else
            this.status.setBanner(`No Songs In Queue`);
    }

}
