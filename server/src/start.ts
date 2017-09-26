
import { server, Config } from './server';

// get the eventual port from the argv
var params = (process.argv.length >= 3) ? process.argv.slice(2) : [];
var opts: Config = {};

if (params.length > 0) {
	opts.port = parseInt(params[0]);
}

// init and start the mock server
server.init(opts).then(function () {
	server.start();
});