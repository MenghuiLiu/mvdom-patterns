
/**
 * This module is to be loaded first in runtime or test, to set the module aliasing matching the server/tsconfig.json
 * 
 * - For runtime, with ts-node, we require this module in the start.ts
 * - For testing, we require this module in the _test/mock/_setup.js which will be loaded with --register in the server/mocha.opts
 * 
 */

const alias = require('module-alias');

const projectDir = __dirname + '/../../';
alias.addAlias('common', projectDir + 'common');
alias.addPath(projectDir + 'server/src');
