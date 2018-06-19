const spawnSync = require('child_process').spawnSync;

async function executeCommand(command, commandArgs, cwd) {
    console.log(`execute command '${command} ${commandArgs.join(' ')}' ${cwd ? `cwd = ${cwd}` : ''}`);
    const result = spawnSync(command, commandArgs, {cwd, stdio: 'inherit', stderr: 'inherit'});

    if (result.status !== 0) {
        throw new Error(`execute command failed with status ${result.status}`);
    }
}

module.exports = { executeCommand };
