// credits to https://github.com/js-n/find-root
var path = require('path')
var fs = require('fs')
module.exports = findRoot;

 function findRoot(start) {
	start = start || module.parent.filename;
	if (typeof start === 'string') {
		if (hasPackageFile(start))
		{
			return start;
		}

		if (start[start.length-1] !== path.sep) {
			start+=path.sep
		}
		start = start.split(path.sep)
	}
	if(!start.length) {
		return null;
	}
	start.pop();
	var dir = start.join(path.sep);

	if (hasPackageFile(dir))
	{
		return dir;
	}

	return findRoot(start)
}

function hasPackageFile(dir)
{
	try {
		var packagePath = path.join(dir, 'package.json');

		fs.statSync(packagePath);
		var packageName = JSON.parse(fs.readFileSync(packagePath,'utf8')).name;

		if (packageName) {
			return true;
		}
	} catch (e) {
	}

	return false;
}