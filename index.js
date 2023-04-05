const sharp = require('sharp');
const fs = require('fs/promises');

const SPRITE_SIZE = 64;
const INPUT_PATH = "images";
const OUTPUT_NAME = "itemsheet";
const CLASS_PREFIX = "monumenta";
const INCLUDE_MINECRAFT_COLORS = false;
const RESIZE_IMAGES_TO_SPRITE_SIZE = false;

function resizeImages() {
    return new Promise(async (resolve) => {
        let imageDir = await fs.opendir(INPUT_PATH);
        for await (const dirEnt of imageDir) {
            if (dirEnt.isFile()) {
                await sharp(`${INPUT_PATH}/${dirEnt.name}`)
                    .resize(SPRITE_SIZE, SPRITE_SIZE, {kernel: sharp.kernel.nearest})
                    .toFile(`${INPUT_PATH}/${dirEnt.name}-RESIZED`);

                // Replace the old sized file with the resized one.
                // This is because Sharp doesn't want input and output paths to be the same.
                await fs.rm(`${INPUT_PATH}/${dirEnt.name}`);
                await fs.rename(`${INPUT_PATH}/${dirEnt.name}-RESIZED`, `${INPUT_PATH}/${dirEnt.name}`);
            }
        }
        
        resolve(true);
    })
}

async function main() {
    if (RESIZE_IMAGES_TO_SPRITE_SIZE) {
        await resizeImages();
    }
    
    let imageCount = (await fs.readdir(INPUT_PATH)).length;
    let spritesPerRow = Math.ceil(Math.sqrt(imageCount));

    let composite = [];
    let compositeX = 0;
    let compositeY = 0;
    // Generate composite array
    let imageDir = await fs.opendir(INPUT_PATH);
    for await (const dirEnt of imageDir) {
        if (dirEnt.isFile()) {
            // This is an image
            composite.push({input: `${INPUT_PATH}/${dirEnt.name}`, left: compositeX * SPRITE_SIZE, top: compositeY * SPRITE_SIZE});
            if (compositeX + 1 == spritesPerRow) {
                compositeX = 0;
                compositeY++;
            } else {
                compositeX++;
            }
        }
    }
    
    await sharp({
        create: {
            width: spritesPerRow * SPRITE_SIZE,
            height: spritesPerRow * SPRITE_SIZE,
            channels: 4,
            background: {r: 0, g: 0, b: 0, alpha: 0}
        }
    })
    .composite(composite)
    .toFile(`out/${OUTPUT_NAME}.png`);

    // Create all the css classes and shove them into a file
    let stylesFile = "";

    if (INCLUDE_MINECRAFT_COLORS) {
        // Add the color classes
        stylesFile +=
            ".minecraft-color-black {\n" +
                "\tcolor: #000000;\n" +
            "}\n\n" +
    
            ".minecraft-color-dark-blue {\n" +
                "\tcolor: #0000AA;\n" +
            "}\n\n" +
    
            ".minecraft-color-dark-green {\n" +
                "\tcolor: #00AA00;\n" +
            "}\n\n" +
    
            ".minecraft-color-dark-aqua {\n" +
                "\tcolor: #00AAAA;\n" +
            "}\n\n" +
    
            ".minecraft-color-dark-red {\n" +
                "\tcolor: #AA0000;\n" +
            "}\n\n" +
    
            ".minecraft-color-dark-purple {\n" +
                "\tcolor: #AA00AA;\n" +
            "}\n\n" +
    
            ".minecraft-color-gold {\n" +
                "\tcolor: #FFAA00;\n" +
            "}\n\n" +
    
            ".minecraft-color-gray {\n" +
                "\tcolor: #AAAAAA;\n" +
            "}\n\n" +
    
            ".minecraft-color-dark-gray {\n" +
                "\tcolor: #555555;\n" +
            "}\n\n" +
    
            ".minecraft-color-blue {\n" +
                "\tcolor: #5555FF;\n" +
            "}\n\n" +
    
            ".minecraft-color-green {\n" +
                "\tcolor: #55FF55;\n" +
            "}\n\n" +
    
            ".minecraft-color-aqua {\n" +
                "\tcolor: #55FFFF;\n" +
            "}\n\n" +
    
            ".minecraft-color-red {\n" +
                "\tcolor: #FF5555;\n" +
            "}\n\n" +
    
            ".minecraft-color-light-purple {\n" +
                "\tcolor: #FF55FF;\n" +
            "}\n\n" +
    
            ".minecraft-color-yellow {\n" +
                "\tcolor: #FFFF55;\n" +
            "}\n\n" +
    
            ".minecraft-color-white {\n" +
                "\tcolor: #FFFFFF;\n" +
            "}\n\n"
    }
    stylesFile +=
        `.${CLASS_PREFIX} {\n` +
            "\tbackground-image: url('data:image/png;base64,"
    // Convert the image to base64 and add it to the file
    let imageData = await sharp(`out/${OUTPUT_NAME}.png`).toBuffer();
    stylesFile += imageData.toString('base64');
    stylesFile +=
        "');\n" +
            "\tbackground-repeat: no-repeat;\n" +
            "\tdisplay: inline-block;\n" +
            "\tvertical-align: middle;\n" +
            `\twidth: ${SPRITE_SIZE}px;\n` +
            `\theight: ${SPRITE_SIZE}px;\n` +
        "}\n\n";
    // Now add all the block classes
    for (let comp of composite) {
        stylesFile += `.${CLASS_PREFIX}-${comp.input.replace(`${INPUT_PATH}/`, "").replace(".png", "").replaceAll("_", "-")} {\n`;
        stylesFile  += `\tbackground-position: ${(comp.left != 0) ? `-${comp.left}px` : "0"} ${(comp.top != 0) ? `-${comp.top}px` : "0"};\n`;
        stylesFile += "}\n\n";
    }
    await fs.writeFile(`out/_${OUTPUT_NAME}.scss`, stylesFile);
}

main();