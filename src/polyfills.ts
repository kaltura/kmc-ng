// Note: in this file, try using either commonjs or es2015 module imports (the currently selected approach is commonjs)
require ('core-js/shim');
require ('zone.js/dist/zone');

//require('tslib');
import 'ts-helpers';

if (process.env.ENV === 'build') {
  // Production

} else {
  // Development

  Error['stackTraceLimit'] = Infinity;

  require('zone.js/dist/long-stack-trace-zone');
}
