import { Client, PresenceStatusData } from 'discord.js';

export class BotStatus {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    setBanner(status: string) {
        this.client.user.setPresence({
            activity: {
                name: status
            }
        });
    }

    setActivity(activity: PresenceStatusData) {
        this.client.user.setStatus(activity)
    }
    
}
