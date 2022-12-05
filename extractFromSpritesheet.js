const sharp = require('sharp');
const fs = require('fs/promises');

const SPRITE_SIZE = 32;

function generateNameMapKey(x, y) {
    return `${x == 0 ? "0" : `-${x}`} ${y == 0 ? "0" : `-${y}`}`;
}

function getImageSize(image) {
    return new Promise(resolve => {
        image
            .metadata()
            .then((metadata) => {
                resolve([metadata.width, metadata.height]);
            });
    });
}

async function main() {
    let image = sharp("base/cbimage.png");
    let [width, height] = await getImageSize(image);

    let nameMapString = await fs.readFile("namemap.json");
    let nameMap = JSON.parse(nameMapString);
    
    let rows = height / SPRITE_SIZE;
    let cols = width / SPRITE_SIZE;
    console.log("Rows:", rows, "Cols:", cols)
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // Need to recreate the image every time becuase the extract modifies the original image...
            sharp("base/cbimage.png")
                .extract({left: j * SPRITE_SIZE, top: i * SPRITE_SIZE, width: SPRITE_SIZE, height: SPRITE_SIZE})
                .toFile(`images/${nameMap[generateNameMapKey(j * SPRITE_SIZE, i * SPRITE_SIZE)].replace("minecraft-", "").replaceAll("-", "_")}.png`)
                
        }
    }
}

main();