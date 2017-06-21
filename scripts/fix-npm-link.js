
const fs = require('fs');
const path = require('path');

// TODO should get this value from the args
var nodeModulesPath = '../node_modules';

var packageRoot = findRoot(process.cwd());

if (!packageRoot) throw new Error("couldn't find package root");

var tsConfigFilePath = path.resolve(packageRoot,'tsconfig.json');
var packageJsonFilePath = path.resolve(packageRoot,'package.json');

if (fs.existsSync(tsConfigFilePath) && fs.existsSync(packageJsonFilePath)) {
	var packageJson = JSON.parse(fs.readFileSync(packageJsonFilePath, 'utf8'));
	var tsConfigFileContent = fs.readFileSync(tsConfigFilePath, 'utf8');
	var tsConfig = JSON.parse(tsConfigFileContent);
	var tsConfigIndent = getJsonIndent(tsConfigFileContent) || 4;


	if (!tsConfig.compilerOptions)
	{
		tsConfig.compilerOptions = { paths : {}};
	}else if (!tsConfig.compilerOptions.paths)
	{
		tsConfig.compilerOptions.paths = {};
	}
	var tsConfigPaths = tsConfig.compilerOptions.paths;

	for (var tsConfigPath in tsConfigPaths) {
		var pathMapping = tsConfigPaths[tsConfigPath];

		if (pathMapping && pathMapping.length === 1 && pathMapping[0].indexOf(nodeModulesPath) === 0) {
			//console.log('remove path mapping for package ' + tsConfigPath);
			delete tsConfigPaths[tsConfigPath];
		}
	}

	if (packageJson.dependencies) {
		for (var packageJsonDependency in packageJson.dependencies) {
			//console.log('add path mapping for package ' + packageJsonDependency);
			tsConfigPaths[packageJsonDependency] = [nodeModulesPath + '/' + packageJsonDependency];
			tsConfigPaths[packageJsonDependency + '/*'] = [nodeModulesPath + '/' + packageJsonDependency + '/*'];
		}
	}

	fs.writeFileSync(tsConfigFilePath,JSON.stringify(tsConfig,null,tsConfigIndent));
	console.log('updated tsconfig.file to include path mapping for all dependencies (essential to support npm link of packages)');
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

// credits to https://github.com/mapbox/detect-json-indent/commit/491b5f87d59091dd266cc6fe6430b26b436a33ad
function getJsonIndent(_) {
	if (_ === '{}') return '    ';
	var lines = _.split('\n');
	if (lines.length < 2) return null;
	var space = lines[1].match(/^(\s*)/);
	return space[0];
};