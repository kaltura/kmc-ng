#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var findRoot = require('./libs/find-root');
var rimraf = require('./libs/rimraf');

// Use folder with nearest package.json as root
var rootPath = findRoot(process.cwd());

try {

  var distLocalMachineFolder =  path.resolve(rootPath, 'dist/__local_machine_only__');
    var serverConfigPath = path.resolve(rootPath,'dist/kmc-config.json');

  if (fs.existsSync(distLocalMachineFolder)) {
    console.log('deleting folder "dist/__local_machine_only__" (should be used for development purposes only)');
    rimraf.sync(distLocalMachineFolder);
  }

    if (fs.existsSync(serverConfigPath)) {
        console.log('deleting file "dist/kmc-config.json" (should be used for development purposes only)');

        rimraf.sync(serverConfigPath);
    }

}catch(e)
{
	console.error('ERROR! failed to delete "dist/__local_machine_only__" and "dist/kmc-config.json" (should be used for development purposes only)');
	throw e
}
