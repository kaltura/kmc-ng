var projectData = require('../kaltura-ws.json');
var exec = require('child_process').exec;

console.log('(git) checkout latest standalone commit');

var commitId = '';
try {
  commitId = projectData.commands.bookmark.standalone[0];
}catch(ex)
{
  console.warn('failed to extract commit id from file "kaltura-ws.json"');
  process.exit(1);
}

if (!commitId)
{
  console.warn('failed to extract commit id from file kaltura-ws.json');
  process.exit(1);
}

exec('git status', function(err) {
  if (err) {
    console.error('it seems that you have un-commited changes. to perform this action you should either commit your changes or reset them. aborting action');
    process.exit(1);
  }

  exec('git checkout ' + commitId, function (checkoutErr) {
    if (checkoutErr) {
      console.error('error occurred. ' + checkoutErr.message || checkoutErr);
      process.exit(1);
    }

    var commitLabel = commitId.length > 8 ? commitId.substr(0,8) : commitId;
    console.log('successfully checkout standalone commit "' + commitLabel  + '". to complete the operation:');
    console.log('- delete "node_modules" folder');
    console.log('- run "npm install"');
    console.log('- run "npm run build -- --prod" to build production application');
  });
});