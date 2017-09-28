const alias = require('module-alias');

console.log('mock/_setup.js start');


// --------- Module Alias --------- //
///// We set the module alias to match the server/tsconfig.json even in test files
const projectDir = __dirname + '/../../../../';
alias.addAlias('common', projectDir + 'common');
alias.addPath(projectDir + 'server/src');
// --------- /Module Alias --------- //

// --------- mockery --------- //
const mockery = require('mockery');
mockery.enable();
mockery.registerAllowable('first');
mockery.warnOnUnregistered(false);


const mockConf = require('./conf');
mockery.registerMock('conf', mockConf);
// --------- /mockery --------- //

console.log('mock/_setup.js end');