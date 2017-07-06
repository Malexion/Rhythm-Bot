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

Simple little music bot to queue up and play youtube vids over discord voice channels, some experimental spotify stuff but nothing solid yet.

## Usage

Run main.js after you have configured and added your token for the bot to use.

There is a built in configurable channel manager to keep the post count of text channels low since this bot tends to say a lot.
