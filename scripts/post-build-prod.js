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

  if (fs.existsSync(distLocalMachineFolder)) {
    console.log('deleting folder "dist/__local_machine_only__"');
    rimraf.sync(distLocalMachineFolder);
  }
}catch(e)
{
	console.error('ERROR! failed to delete folder "dist/__local_machine_only__". make sure you delete it manually');
	throw e
}
