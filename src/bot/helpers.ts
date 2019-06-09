
import { Message, VoiceConnection } from 'discord.js';

export function joinUserChannel(msg: Message): Promise<VoiceConnection> {
    return new Promise((done, error) => {
        let channel = msg.member.voiceChannel;
        if(channel && channel.type === 'voice') {
            channel.join()
                .then(connection => {
                    done(connection);
                });
        } else
            error(`User isn't on a voice channel!`);
    });
}
