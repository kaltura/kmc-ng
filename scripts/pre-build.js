
const fs = require('fs');
const path = require('path');
const findRoot = require('./libs/find-root');
var globby = require('globby');
var rimraf = require('./libs/rimraf');

const packageRoot = findRoot(process.cwd());
if (!packageRoot) throw new Error("couldn't find package root");

const sourceFileName = "src/configuration/server-config-example.json";
const sourceFilePath = path.resolve(packageRoot,sourceFileName);
const targetFileName = "src/server-config.json";
const targetFilePath = path.resolve(packageRoot,targetFileName);

if (!fs.existsSync(targetFilePath)) {
    console.log(`cannot find configuration file. creating new file '${targetFileName}' using '${sourceFileName}' (should be used during development)`);
    fs.createReadStream(sourceFilePath).pipe(fs.createWriteStream(targetFilePath));
}

// Use folder with nearest package.json as root
const localePath = path.join(packageRoot, './node_modules/moment/locale/*');
console.log('deleting all moment locale files to prevent them from bundling into the app (see https://github.com/angular/angular-cli/issues/6137)');
globby([localePath])
    .then(function then(paths) {
        paths.map(function map(item) {
            rimraf.sync(item);
        });
    });
