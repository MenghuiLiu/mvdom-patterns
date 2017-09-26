console.log("mock/_setup.js to alias all of the mock modules");

// --------- mockery way --------- //
const mockery = require("mockery");
mockery.enable();
mockery.registerAllowable("first");
mockery.warnOnUnregistered(false);


const mockBar = require("./mock-bar");
mockery.registerMock("bar", mockBar); // Note: this plays nice with ts/ts-node baseUrl (because it does not try to resolve 'base', just swap it)
// mockery.registerMock("./bar", mockBar); // Note: would need to register all used path to the same module
// --------- /mockery way --------- //


// --------- module-alias way --------- //
// NOTE: This is an alternative way. Mockery gives more granularity, but module-alias might be required anytway for the baseUrl to work.
// const moduleAlias = require('module-alias');
// moduleAlias.addAlias('../bar', __dirname + '/mock-bar');
// --------- /module-alias way --------- //

// --------- rewiremock way  --------- //
// Note: Not working with baseUrl, rewritemock tries to find the 'bar', but because it not exec by ts-node, the mapping is not done.
// const rewire = require("rewiremock").default;
// rewire('bar').by(__dirname + '/mock-bar'); // Note: this does NOT play nice with ts/ts-node baseUrl (module 'bar' not found)
// rewire('../bar').by(__dirname + '/mock-bar'); // <-- that work fine, but require relative addressing
//rewire.enable();
// --------- /rewiremock way  --------- //