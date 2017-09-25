console.log("mock/_setup.js to alias all of the mock modules");


// --------- Mockery Way --------- //
const mockery = require("mockery");
mockery.enable();
mockery.registerAllowable("first");
mockery.warnOnUnregistered(false);

// right now, we do by hand
// TOTO: Need to make baseUrl work so that we have only one path per module. 
//       With tsc (easy, tsconfig), node (probably with module-alias), 
//       VSCode (not sure how, because it does not seem to follow tsconfig)
const mockBar = require("./mock-bar");
mockery.registerMock("bar", mockBar);
// mockery.registerMock("./bar", mockBar); // if we want to catch this as well.
// --------- /Mockery Way --------- //


// --------- ModuleAlias --------- //
// NOTE: This is an alternative way. Mockery gives more granularity, but module-alias might be required anytway for the baseUrl to work.
// const moduleAlias = require('module-alias');
// moduleAlias.addAlias('../bar', __dirname + '/mock-bar');
// --------- /ModuleAlias --------- //