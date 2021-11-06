
import { joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import {  Message, MessageEmbed } from 'discord.js';

import * as moment from 'moment';

export function joinUserChannel(msg: Message): Promise<VoiceConnection> {
    return new Promise((done, error) => {
        let channel = msg.member.voice.channel;
        if(channel && channel.type  === 'GUILD_VOICE') {
             let connection = joinVoiceChannel({
                    channelId: msg.member.voice.channel.id,
                    guildId: msg.guild.id,
                    adapterCreator: msg.guild.voiceAdapterCreator
                });
                done(connection);
              
        } else
            error(`User isn't on a voice channel!`);
    });
}

export function secondsToTimestamp(seconds: number): string {
    return moment()
        .startOf('day')
        .seconds(seconds)
        .format('HH:mm:ss');
}

export function createEmbed() {
    return new MessageEmbed()
        .setColor('#a600ff');
}

export function createErrorEmbed(message: string) {
    return new MessageEmbed()
        .setColor('#ff3300')
        .setTitle('Error')
        .setDescription(message);
}

export function createInfoEmbed(title: string, message: string='') {
    return new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setDescription(message);
}
