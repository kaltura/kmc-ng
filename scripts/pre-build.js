
const fs = require('fs');
const path = require('path');
const findRoot = require('./libs/find-root');

const packageRoot = findRoot(process.cwd());
if (!packageRoot) throw new Error("couldn't find package root");

const sourceFileName = "configuration/kmc-config-example.json";
const sourceFilePath = path.resolve(packageRoot,sourceFileName);
const targetFileName = "src/kmc-config.json";
const targetFilePath = path.resolve(packageRoot,targetFileName);

if (!fs.existsSync(targetFilePath)) {
    console.log(`cannot find configuration file. creating new file '${targetFileName}' using '${sourceFileName}' (should be used during development)`);
    fs.createReadStream(sourceFilePath).pipe(fs.createWriteStream(targetFilePath));
}
