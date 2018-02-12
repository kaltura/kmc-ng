
const fs = require('fs');
const path = require('path');

var packageRoot = findRoot(process.cwd());
if (!packageRoot) throw new Error("couldn't find package root");

var serverConfigPath = path.resolve(packageRoot,'src/configuration/server-config.json');

if (fs.existsSync(serverConfigPath)) {
	var serverConfig = JSON.parse(fs.readFileSync(serverConfigPath, 'utf8'));

    const externalApps = serverConfig.externalApps;

    ensureNoLocalMachine(externalApps, 'externalApps');

}

function ensureNoLocalMachine(config, parentKeyToken) {
  for (const key in config) {

    const value = config[key];
    const keyToken = parentKeyToken + '.' + key;

    if (value
      && typeof value === 'string'
      && value.indexOf('__local_machine_only__') !== -1) {
      throw new Error("operation aborted. cannot deploy to production when server configuration has external app mapped to '__local_machine_only__'. key = " + keyToken);
    }

    if (typeof value === 'object') {
      ensureNoLocalMachine(value, keyToken);
    }
  }
}

// credits to https://github.com/js-n/find-root/commit/1c0c9813e26520a8857fe7522b9e04fad05362c2
function findRoot(start) {
	start = start || module.parent.filename
	if (typeof start === 'string') {
		if (start[start.length-1] !== path.sep) {
			start+=path.sep
		}
		start = start.split(path.sep)
	}
	if(!start.length) {
		throw new Error('package.json not found in path')
	}
	start.pop()
	var dir = start.join(path.sep)
	try {
		fs.statSync(path.join(dir, 'package.json'));
		return dir;
	} catch (e) {}
	return findRoot(start)
}

console.log("check file 'src/configuration/config-server.json file'. make sure it doesn't have external app mapped to \'__local_machine_only__\'");
ensureNoLocalMachine();