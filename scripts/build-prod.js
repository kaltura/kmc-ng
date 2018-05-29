#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var findRoot = require('./libs/find-root');
var rimraf = require('./libs/rimraf');
var spawnSync = require('child_process').spawnSync;

// Use folder with nearest package.json as root
var rootPath = findRoot(process.cwd());
var argv = require('minimist')(process.argv.slice(2));

const buildCommand = 'ng';
const buildArgs = ['build','--prod','--preserve-symlinks','--aot', '--extract-licenses'];

const deployUrl = argv['deploy-url'];
if (deployUrl) {
    buildArgs.push(`--deploy-url=${deployUrl}`);
}

console.log(`${buildCommand} ${buildArgs.join(' ')}`);
spawnSync(buildCommand, buildArgs, { stdio: 'inherit' });

try {
    var distLocalMachineFolder =  path.resolve(rootPath, 'dist/__local_machine_only__');
    var serverConfigPath = path.resolve(rootPath,'dist/server-config.json');

    if (fs.existsSync(distLocalMachineFolder)) {
        console.log('deleting folder "dist/__local_machine_only__" (this resource should be used for development purposes only)');
        rimraf.sync(distLocalMachineFolder);
    }

    if (fs.existsSync(serverConfigPath)) {
        console.log('deleting file "dist/server-config.json" (this resource should be used for development purposes only)');

        rimraf.sync(serverConfigPath);
    }

}catch(e)
{
    console.error('ERROR! failed to delete "dist/__local_machine_only__" and "dist/server-config.json" (those resources should be used for development purposes only)');
    throw e
}




