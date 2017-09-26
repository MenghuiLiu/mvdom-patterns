import { Server as HapiServer, PluginRegistrationObject, RouteConfiguration, CorsConfigurationObject } from 'hapi';
import * as Inert from 'inert';
import { exec } from 'child_process';

import { routes as osUsageRoutes } from './api/os-usage';

var isWin = /^win/.test(process.platform);

// Note: this is to pass the type checking
var inert = Inert as PluginRegistrationObject<{}>;

export interface Config {
	host?: string;
	port?: number;
	clientRoot?: string;
	routes?: {
		cors?: true | CorsConfigurationObject;
	}

}
// Default app config. 
// Depending on the properties, it will be used for the connection properties or 
var defaultCfg: Config = {
	//host: 'localhost',    // connection host (if we do this, it won't work when deploy in another host)
	port: 8080,			    // connection port
	clientRoot: process.cwd() + '/client/web/', // root of the client files (which will be served statically)	
	routes: { // his is for cors
		cors: {
			origin: ['*'],
			additionalHeaders: ["Accept-language"]
		}
	}
};


// App is a simple convenience Hapi/Server wrapper. 
class Server {
	cfg: Config;
	hapiServer: HapiServer;

	async init(cfg: Config) {

		this.cfg = Object.assign({}, defaultCfg, cfg);

		this.hapiServer = new HapiServer();

		// register plugins
		this.hapiServer.register(inert, function () { });

		// start server
		this.hapiServer.connection({ host: this.cfg.host, port: this.cfg.port, routes: this.cfg.routes });

		// Bind static files to Inert plugin (this will server )
		this.hapiServer.route({
			method: '*',
			path: '/{path*}',
			handler: {
				directory: {
					path: (request: any) => {
						console.log(' > ' + new Date().getTime() + ' ' + request.method.toUpperCase() + ' ' + request.path, this.cfg.clientRoot);
						return this.cfg.clientRoot;
					},
					listing: true,
					index: ['index.html', 'default.html']
				}
			}
		});

		// load the osUsage API routes
		this.hapiServer.route(osUsageRoutes);
	}

	start() {
		// Start the server
		this.hapiServer.start((err: any) => {

			if (err) {
				throw err;
			}

			// open browser
			if (isWin) {
				exec('start http://localhost:' + this.cfg.port, function (error, stdout, stderr) { });
			} else {
				exec('open http://localhost:' + this.cfg.port, function (error, stdout, stderr) { });
			}

			console.log('Server running at:', this.hapiServer.info!.uri);
		});
	}
}


export const server = new Server();