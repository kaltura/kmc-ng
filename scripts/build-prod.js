const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const findRoot = require('./libs/find-root');
var execSync = require('child_process').execSync;

const paramsVersion = process.argv.find(a => a.startsWith('v'));
if (!paramsVersion) {
  throw new Error(`please, specify version as 'vx.x.x'`);
}
const versionNumber = paramsVersion.substring(1);
const zipName = `kmc-ng-${versionNumber}.zip`;
// STEP: check uncommitted changes
try {
  execSync('git diff --exit-code');
}
catch (error) {
  console.error('it seems that you have un-commited changes. to perform this action you should either commit your changes or reset them. aborting action');
  // process.exit(1);
}

// STEP: check existence of tag with the version
/*
try {
  const tagExistence = execSync(`git tag -l "v${versionNumber}"`).toString();
  if (tagExistence) {
    console.error('tag has been already created');
    process.exit(1);
  }
} catch (error) {
  console.error(error);
  process.exit(1);
}
*/
const packageRoot = findRoot(process.cwd());
if (!packageRoot) throw new Error("couldn't find package root");

// STEP: empty dist folder
fse.emptyDirSync(path.resolve(packageRoot, 'dist'));

// STEP: update src/configuration/analytics-config.ts
const configFileName = "src/configuration/global-config.ts";
const configFilePath = path.resolve(packageRoot, configFileName);
let configData = fs.readFileSync(configFilePath, 'utf8');
const regex = /appVersion: '\d{1,2}\.\d{1,2}\.\d{1,2}'/;
configData = configData.replace(regex, `appVersion: '${versionNumber}'`);

fs.writeFileSync(configFilePath, configData, 'utf-8');
console.log('global-config.ts has been updated!');

// STEP: update deploy/config.ini
const v2PlayerConfigFileName = "deploy/config.ini";
const v2ConfigFilePath = path.resolve(packageRoot, v2PlayerConfigFileName);
let v2ConfigData = fs.readFileSync(v2ConfigFilePath, 'utf8');
const regex_v2 = /component.version=v\d{1,2}\.\d{1,2}\.\d{1,2}/;
v2ConfigData = v2ConfigData.replace(regex_v2, `component.version=v${versionNumber}`);

fs.writeFileSync(v2ConfigFilePath, v2ConfigData, 'utf-8');
console.log('v2 player config has been updated!');

// STEP: update deploy_v7/config.ini
const v7PlayerConfigFileName = "deploy_v7/config.ini";
const v7ConfigFilePath = path.resolve(packageRoot, v7PlayerConfigFileName);
let v7ConfigData = fs.readFileSync(v7ConfigFilePath, 'utf8');
const regex_v7 = /component.version=v\d{1,2}\.\d{1,2}\.\d{1,2}/;
v7ConfigData = v7ConfigData.replace(regex_v7, `component.version=v${versionNumber}`);

fs.writeFileSync(v7ConfigFilePath, v7ConfigData, 'utf-8');
console.log('v7 player config has been updated!');

// STEP: update package.json
const packageJsonPath = path.resolve(packageRoot, 'package.json');
const packageData = fs.readFileSync(packageJsonPath);
let packageJsonObj = JSON.parse(packageData);
const commitRequired = packageJsonObj.version !== versionNumber;
packageJsonObj.version = versionNumber;
packageJsonObj = JSON.stringify(packageJsonObj, null, 2);

fs.writeFileSync(packageJsonPath, packageJsonObj);
console.log('Package.json has been updated!');

// STEP: commit changed files to git if needed
if (commitRequired) {
  try {
    execSync(`git commit -am "bump kmc version to v${versionNumber}"`);
  } catch (error) {
    console.error('Git commit operation failed. Verify you are logged into Github and have permissions to commit to this repository');
    process.exit(1);
  }
}

// STEP: push commit to origin
try {
  execSync(`git push origin`);
}
catch (error) {
  console.error('Git push operation failed. Verify you are logged into Github and have permissions to push to this repository');
  process.exit(1);
}

// STEP: make production build
console.log('---start production build---');
try {
  execSync('ng build --configuration=production');
}
catch (error) {
  console.error(error);
  process.exit(1);
}
console.log('---finish production build---');

// STEP: copy production build to folder v*.*.*
const dir = path.resolve(packageRoot, 'dist/v' + versionNumber);
if (fs.existsSync(dir)) {
  fs.rmSync(dir, {recursive: true});
}

console.log('---copy production build files---');
try {
  fs.rmSync(path.resolve(packageRoot, 'dist/kmc/__local_machine_only__'), {recursive: true});
  fse.copySync(path.resolve(packageRoot, 'dist/kmc'), dir);
  console.log('---finish production build files---');
} catch (err) {
  console.error(err);
  process.exit(1);
}

// STEP: copy player deployment folders
console.log('---copy player deployment folders---');
try {
  fse.copySync(path.resolve(packageRoot, 'deploy'), dir + '/deploy');
  fse.copySync(path.resolve(packageRoot, 'deploy_v7'), dir + '/deploy_v7');
} catch (err) {
  console.error(err);
  process.exit(1);
}

let opts = {
  "cwd": `dist`,
  "env": process.env
};

// STEP: create zip with new version
try {
  execSync(`zip -r ${zipName} v${versionNumber}/ -x "*.DS_Store" -x "__MACOSX"`, opts);
}
catch (error) {
  console.error('Zip creation error: ', error);
  process.exit(1);
}

// STEP: delete dist folders
fse.remove(dir);
fse.remove(path.resolve(packageRoot, 'dist/kmc'));

// STEP: create tag with new version
/*
try {
  execSync(`git tag v${versionNumber}`);
}
catch (error) {
  console.error('cannot create tag: ', error);
  process.exit(1);
}


// STEP: push tag to origin
try {
  execSync(`git push origin v${versionNumber}`);
}
catch (error) {
  console.error('Git push operation failed. Verify you are logged into Github and have permissions to push to this repository');
  process.exit(1);
}

// STEP: release new version to GitHub and upload zip
const zipPath = path.resolve(packageRoot, `dist/${zipName}`);
try {
  execSync(`gh release create v${versionNumber} ${zipPath} --title "KMC Analytics v${versionNumber}"`);
}
catch (error) {
  console.error('cannot upload release: ', error);
  process.exit(1);
}
console.log('\x1b[32m%s\x1b[0m', `Version created successfully! You can find the new release here: https://github.com/kaltura/analytics-front-end/releases/tag/v${versionNumber}`);
*/
console.log('\x1b[32m%s\x1b[0m', `Version created successfully! You can find the zipped version here: dist/${zipName}`);

