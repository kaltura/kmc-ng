const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');
const findRoot = require('../../../scripts/libs/find-root');

const rootPath = findRoot(process.cwd());
const csvFilePath = path.resolve(rootPath, 'docs/kaltura-internal-docs/contextual-help.csv');
const jsonOutputFilePath = path.resolve(rootPath, 'src/public/contextual-help.json');

try {
    csv()
        .fromFile(csvFilePath)
        .then(mapJsonObj)
        .then(writeJsonString);
} catch (e) {
    console.log(`Couldn't generate json file`, e);
}


function mapJsonObj(input) {
    let result = [];
    if (input && Array.isArray(input)) {
        result = input
            .reduce((groups, currentValue) => {
                if (groups.indexOf(currentValue.viewKey) === -1) {
                    groups.push(currentValue.viewKey);
                }
                return groups;
            }, [])
            .map((group) => {
                return {
                    viewKey: group,
                    links: input
                        .filter(({viewKey, linkValue, linkLabel}) => viewKey === group && !!linkValue && !!linkLabel)
                        .map(({linkValue, linkLabel}) => ({value: linkValue, label: linkLabel}))
                }
            });
    }
    return JSON.stringify(result, null, 4);
}

function writeJsonString(jsonString) {
    fs.writeFile(jsonOutputFilePath, jsonString, 'utf8', (err) => {
        if (err) {
            return console.log(err);
        }

        console.log(`"src/public/contextual-help.json" was saved, don't forget to commit the file!`);
    });
}
