
export interface BotConfig {
    auto?: {
        deafen?: boolean,
        pause?: boolean,
        play?: boolean,
        reconnect?: boolean
    };
    command?: {
        symbol: string;
    },
    discord: {
        token: string;
        log?: boolean;
    },
    queue?: {
        announce?: boolean;
        repeat?: boolean;
    },
    stream?: {
        seek?: number;
        packetLossPercentage?: number;
        forwardErrorCorrection?: boolean;
        volume?: number;
        bitrate?: number | 'auto';
    },
    emojis?: {
        addSong?: string;
        stopSong?: string;
        playSong?: string;
        pauseSong?: string;
        skipSong?: string;
    }
}

export const DefaultBotConfig: BotConfig = {
    auto: {
        deafen: false,
        pause: false,
        play: false,
        reconnect: true
    },
    discord: {
        token: '<BOT-TOKEN>',
        log: true
    },
    command: {
        symbol: '!'
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
};
