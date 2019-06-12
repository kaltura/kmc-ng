const fs = require('fs');
const path = require('path');
const args = require('yargs').argv;
const outPutFolder = path.resolve(__dirname, 'output');
const mime = require('mime');
const cssbeautify = require('cssbeautify');

let folderPath = args.dir;
let outPutFileName = args.outputName;
let classPrefix = args.classPrefix;

if (!folderPath) {
    console.log('--dir parameter is required, abort execution');
    process.exit(1);
}

if (!outPutFileName) {
    console.log('--outputName parameter is not provided, using default output name');
    outPutFileName = 'styles';
}

if (!classPrefix) {
    console.log('--classPrefix parameter is not provided, using default one');
    classPrefix = '.';
}

try {
    const folder = fs.readdirSync(folderPath) || [];

    if (!folder.length) {
        console.log('Provided folder is empty, abort execution');
        process.exit(1);
    }

    const styleString = folder
        .map(file => {
            const filePath = path.resolve(folderPath, file);
            const fileType = mime.getType(filePath);
            if (!fileType.includes('image')) {
                return null;
            }

            const base64String = fs.readFileSync(filePath, 'base64');
            const name = path.parse(file).name;
            const string = `data:${fileType};base64,${base64String}`;

            return { string, name };
        })
        .filter(Boolean)
        .reduce((acc, val) => {
            acc += `
            ${classPrefix}${val.name} {
                background-image: url('${val.string}');
            }
        `;
            return acc;
        }, '');

    const output = cssbeautify(styleString);
    const outputPath = path.resolve(folderPath, `${outPutFileName}.scss`);

    fs.writeFileSync(outputPath, output);

    console.log(`Conversion completed, check ${outputPath} for result`);
} catch (e) {
    console.log(e.message);
    process.exit(1);
}