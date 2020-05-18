
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
        passes?: number;
        volume?: number;
        bitrate?: number | 'auto';
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
        token: '<NzA1ODUyNDcyNDk2ODgxNzE2.XsKstw.4nf5bhTbZ5H8pX4-MOUGxMFYcDE>',
        log: true
    },
    command: {
        symbol: ','
    },
    queue: {
        announce: true,
        repeat: false
    },
    stream: {
        seek: 0,
        passes: 3, 
        volume: 1,
        bitrate: 'auto'
    }
};
