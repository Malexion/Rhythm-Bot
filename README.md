# Rhythm-Bot 2.1.5 Search / Rich Text / Buttons!

-   New search command anything after !search will be searched against youtube and return the top 3 results
-   Press the thumbs up reaction emoji to add the item to your queue
    -   Note that you will want to give the bot permission to remove emojis in the text channel, this is the MANAGE_MESSAGES permission
-   Node version has updated from 10.x.x to 12.x.x due to discord.js update
-   New npm packages to install
-   Replaced dependence on manually installing ffmpeg
    -   Now ffmpeg is installed via npm with ffmpeg-static when you do a simple npm install
-   In addition to the reaction button interaction on the search command you can now use buttons for the new playing control

![Image](https://imgur.com/B2xLVgU.png)

Note: This is not the bot listed here [https://rythmbot.co/](https://rythmbot.co/)

## Description

Simple little music bot to queue up and play youtube audio over discord voice channels.

## Bot Commands

-   Show some helpful info
    > `!help`
-   Search for a video on YouTube
    > `!youtube https://www.youtube.com/watch?v=dQw4w9WgXcQ`
-   Join your voice channel
    > `!join`
-   Start the queue
    > `!play`
-   Search for a song
    > `!search don't stop believin`
-   List songs in the queue
    > `!list`
-   Shuffle the queue
    > `!shuffle`
-   Clear the queue
    > `!clear`
-   Move song in queue
    > `!move [targetIndex] [up/down/destIndex]`

## Bot Hosting

### Unlisted dependencies

-   `Python2.7` This version is required for node-gyp I think?
-   `node-gyp` command line tool
-   `node.js` version 12.X.X or higher is required
-   `typescript` types for javascript, enables easier group collaboration and simple right click to look up definitions

### Installation

-   Install node latest stable release, this was built with node v12.16.1
-   For windows run `npm install --global --production --add-python-to-path windows-build-tools`
    -   Run `npm install node-gyp -g`
    -   Run `npm install typescript -g`
    -   Run `npm install`

### Configuration

-   Get a token string for your bot from by registering your bot here: [https://discordapp.com/developers](https://discordapp.com/developers)
    -   Create an invite link like this
        `https://discordapp.com/api/oauth2/authorize?client_id={ APPLICATION ID }&permissions=2159044672&scope=bot`
-   Open `bot-config.json` and replace the content between the quotes `"<BOT-TOKEN-HERE>"` with your bot token.
    -   In config you can add other settings, to see an example of the settings open `./src/bot/config.ts` and look at `DefaultBotConfig` and `BotConfig` for examples
-   Open `bot.log` if you're looking to debug errors

### Running the Application

-   Run `npm start`
