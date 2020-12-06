<<<<<<< HEAD
import { Client, PresenceStatus } from "discord.js";
import { stat } from "fs";
=======
import { Client, PresenceStatusData } from 'discord.js';
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5

export class BotStatus {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    setBanner(status: string) {
        this.client.user.setPresence({
<<<<<<< HEAD


          
          status:"online"//recheck
          /* game: {
=======
            activity: {
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
                name: status
            }*/
        });
    }

<<<<<<< HEAD
    setActivity(activity: PresenceStatus) {
        this.client.user.setStatus("online");//activity
=======
    setActivity(activity: PresenceStatusData) {
        this.client.user.setStatus(activity)
>>>>>>> 6d089bc2b81420a59a7bf801b56fe14884a28ad5
    }
    
}
