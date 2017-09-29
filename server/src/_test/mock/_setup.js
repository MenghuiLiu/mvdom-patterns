require('../../setup-module-aliases');

console.log('mock/_setup.js start');

// --------- mockery --------- //
const mockery = require('mockery');
mockery.enable();
mockery.registerAllowable('first');
mockery.warnOnUnregistered(false);


const mockConf = require('./conf');
mockery.registerMock('conf', mockConf);
// --------- /mockery --------- //

console.log('mock/_setup.js end');