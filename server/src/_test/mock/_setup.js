const alias = require('module-alias');

console.log('mock/_setup.js start');

// we set the common alias and the server/src as path, to mirror server/tsconfig.json (when running)
const projectDir = __dirname + '/../../../../';
alias.addAlias('common', projectDir + 'common');
alias.addPath(projectDir + 'server/src');

// --------- mockery way --------- //
const mockery = require('mockery');
mockery.enable();
mockery.registerAllowable('first');
mockery.warnOnUnregistered(false);


const mockBar = require('./mock-bar');
mockery.registerMock('bar', mockBar); // Note: this plays nice with ts/ts-node baseUrl (because it does not try to resolve 'base', just swap it)

const mockConf = require('./conf');
mockery.registerMock('conf', mockConf);

console.log('mock/_setup.js end');
// mockery.registerMock("./bar", mockBar); // Note: would need to register all used path to the same module
// --------- /mockery way --------- //