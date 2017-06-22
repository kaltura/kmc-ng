#!/usr/bin/env node
'use strict';

// NOTICE - this code should not require libraries (it is used during preinstall).
var fs = require('fs');
var path = require('path');
var findRoot = require('./libs/find-root');
var rimraf = require('./libs/rimraf');
// NOTICE - this code should not require libraries (it is used during preinstall).

(async() => {
	// Use folder with nearest package.json as root
	var rootPath = findRoot(process.cwd());

	if (rootPath) {
		var distPath =  path.resolve(rootPath, 'dist');

		if (fs.existsSync(distPath)) {
			await deletePath(distPath);
			fs.mkdirSync(distPath);
		}

		preparePackageJsonFile(rootPath);
	}
})();


function preparePackageJsonFile(rootPath)
{
	var libPkg = JSON.parse(fs.readFileSync(path.resolve(rootPath, 'package.json'),'utf8'));

	libPkg.devDependencies = {};
	libPkg.peerDependencies = libPkg.dependencies;
	libPkg.dependencies = {};
	libPkg.scripts = {};
	libPkg.private = false;

	if (libPkg.directories && libPkg.directories.npmDist)
	{
		delete libPkg.directories.npmDist;
	}

	fs.writeFileSync(path.resolve(rootPath,'dist/package.json'),JSON.stringify(libPkg,null,2));
}

async function deletePath(path) {

	return new Promise((resolve, reject) => {

		if (fs.existsSync(path)) {
			rimraf(path, function () {
				resolve();
			});
		} else {
			resolve();
		}
	});
}


function copyFile(source, target, cb) {
	var cbCalled = false;

	var rd = fs.createReadStream(source);
	rd.on("error", function (err) {
		done(err);
	});
	var wr = fs.createWriteStream(target);
	wr.on("error", function (err) {
		done(err);
	});
	wr.on("close", function (ex) {
		done();
	});
	rd.pipe(wr);

	function done(err) {
		if (!cbCalled) {
			cb(err);
			cbCalled = true;
		}
	}
}
