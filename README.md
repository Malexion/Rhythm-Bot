# Rhythm-Bot 3.0.0 Search / Rich Text / Buttons!
- Improved !search, !play commands !
- Press the thumbs up reaction emoji to add the item to your queue
    - Note that you will want to give the bot permission to remove emojis in the text channel, this is the MANAGE_MESSAGES permission
- Node version has  been updated to 16.x.x
- New npm packages to install
- Reversed from ffmpeg-static npm package to manually compiled and configurated ffmpeg (because it just works better for me)
    - ./configure --enable-nonfree --enable-opus --enable-libfdk-aac --enable-gpl
- In addition to the reaction button interaction on the search command you can now use buttons for the new playing control
- Can play live Youtube video !
- __!help will display command list__ 


![Image](https://imgur.com/B2xLVgU.png)

Note: This is not the bot listed here [https://rythmbot.co/](https://rythmbot.co/)

## Description

Simple little music bot to queue up and play youtube audio over discord voice channels.

## Unlisted dependencies

- `Python2.7` This version is required for node-gyp I think?
- `node-gyp` command line tool
- `node.js` version 16.X.X or higher is required
- `typescript` types for javascript, enables easier group collaboration and simple right click to look up definitions

## Installation

- Install node latest stable release, this was built with node v16.13.1
- For windows run `npm install --global --production --add-python-to-path windows-build-tools`
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

## Limitations
- It cannot play ex-live videos
- It cannot play age restricted videos
- On very rare ocasions playing video is skipped