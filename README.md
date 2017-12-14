# Rhythm-Bot

## Unlisted dependencies

- `Python2.7` This version is required for node-gyp I think?
- `FFMPEG` command line tool
- `node-gyp` command line tool
- `node.js` version 6.X.X or higher

## Installation

- Install node latest stable release, this was built with node v6.11.0
- For windows run `npm install --global --production windows-build-tools`
    - Run `npm config set python python2.7`
    - Install FFMPEG from the website and add it to your system path. EX: `C:\ffmpeg\bin`
    - Run `npm install node-gyp -g`
    - Run `npm install`

## Description

Simple little music bot to queue up and play youtube vids over discord voice channels, spotify bits are put on hold since spotify changed their api awhile back and I can't get at the music files easily.

## Usage

To get started open up ```main.js``` and add your bot token between the tick marks ```'...'``` where it says ```'<BOT-TOKEN-HERE>'```, which you can currently aquire from registering an app at [https://discordapp.com/developers](https://discordapp.com/developers)

Run ```main.js``` with start.bat or running ```node main``` in command line after you have configured and added your token for the bot to use.

There is a built in configurable channel manager to keep the post count of text channels low since this bot tends to say a lot. By default it'll watch all channels for it's commands and respond in that channel which includes pms.

You can modify other config settings by adding the property and sub properties you want to modify to the object passed into ```RhythmBot({...})``` in ```main.js```. The channel manager is left commented out in the config file as an example.

If your having errors, try looking into the ```rhythm-bot-log.log``` file to find the source of the cause.
