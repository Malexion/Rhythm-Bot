import { Message, VoiceConnection } from 'discord.js';
 import  *  as moment from 'dayjs';




export function joinUserChannel(msg: Message): Promise<VoiceConnection> {
    return new Promise((done, error) => {
       let channel = msg.member.voice.channel
        if(channel && channel.type === 'voice') {
            channel.join()
                .then(connection => {
                    done(connection);
                });
        } else
            error(`User isn't on a voice channel!`);
    });
}


export function secondsToTimestamp(seconds: number): string {
    return moment()
        .startOf('day')
        .second(seconds)
        .format('HH:mm:ss');
}
