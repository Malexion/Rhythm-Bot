# Rhythm-Bot 2.1.5 Search / Rich Text / Buttons!
- New search command anything after !search will be searched against youtube and return the top 3 results
- Press the thumbs up reaction emoji to add the item to your queue
    - Note that you will want to give the bot permission to remove emojis in the text channel, this is the MANAGE_MESSAGES permission
- Node version has updated from 10.x.x to 12.x.x due to discord.js update
- New npm packages to install
- Replaced dependence on manually installing ffmpeg
    - Now ffmpeg is installed via npm with ffmpeg-static when you do a simple npm install
- In addition to the reaction button interaction on the search command you can now use buttons for the new playing control

![Image](https://imgur.com/B2xLVgU.png)

Note: This is not the bot listed here [https://rythmbot.co/](https://rythmbot.co/)

## Description

Simple little music bot to queue up and play youtube audio over discord voice channels.

## Unlisted dependencies

- `Python2.7` This version is required for node-gyp I think?
- `node-gyp` command line tool
- `node.js` version 12.X.X or higher is required
- `typescript` types for javascript, enables easier group collaboration and simple right click to look up definitions

## Installation

- Install node latest stable release, this was built with node v12.16.1
- For windows run `npm install --global --production windows-build-tools`
    - Run `npm config set python python2.7`
    - Run `npm install node-gyp -g`
    - Run `npm install typescript -g`
    - Run `npm install`

## Configuration

- Get a token string for your bot from by registering your bot here: [https://discordapp.com/developers](https://discordapp.com/developers)
    - You should be able to find options to invite your bot to a channel here as well
- Open `bot-config.json` and replace the content between the quotes ```"<BOT-TOKEN-HERE>"``` with your bot token.
    - In config you can add other settings, to see an example of the settings open `./src/bot/config.ts` and look at `DefaultBotConfig` and `BotConfig` for eamples
- Open `bot.log` if your looking to debug errors

## Running the Application

- Run `npm start`
