## Spritesheet Maker
##### Made by FlamingoBike#6228

---

## Description

This tool allows you to input a bunch of images and compress them into a spritesheet. It also generates a Sass file with the image's Base64 data and one class for every block found on the spritesheet, with its coordinates.
This was made for the Monumenta Website.

---

## How to use

- You must have Node and npm installed on your machine (NOTE: This was made with node v.16.15.0 ; if you want an easy way to change node version, check `nvm`).
- Run `npm i` to install the packages needed for this script to work.
- Place all the images you want to put on the spritesheet, in the `images` folder. By default, the must all be 32x32 in size, but you can edit the `index.js` file (line 4) if you want a higher resolution (the program assumes square images, still).
- Run `node .` in the folder of the project. If everything goes well, you should see the spritesheet and the Sass styles file in the `out` folder.
- Note: the "base" folder contains the original spritesheet, which I split up into different sprites by using the `extractFromSpritesheet.js` script - keeping this for nostalgia :) (if you ever want to split up a spritesheet, just modify the constants in the script to your need, and run `node extractFromSpritesheet.js`). This requires a name map, an example of which can be found at `namemap.json` if you want each image to be renamed according to what it actually represents (like the specific minecraft block).