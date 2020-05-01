import { Client, PresenceStatus } from "discord.js";
import { stat } from "fs";

export class BotStatus {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    setBanner(status: string) {
        this.client.user.setPresence({


          
          status:"online"//recheck
          /* game: {
                name: status
            }*/
        });
    }

    setActivity(activity: PresenceStatus) {
        this.client.user.setStatus("online");//activity
    }
    
}
