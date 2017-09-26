const router = require("cmdrouter");
const path = require("path");
const fs = require("fs-extra-plus");

const { tmplFiles, pcssFiles, rollupFiles } = require("./processors.js");

// NOTE: At this point, this for the client build only, as the server use ts-node and does not need pre/post processing

// Define the constant for this project (needs to be before the router...route())
const rootDir = "./client/"; // here we assume we script will be run from the package.json dir
const srcDir = path.join(rootDir, "src/");
const webDir = path.join(rootDir, "web/");

const jsDistDir = path.join(webDir, "js/");
const cssDistDir = path.join(webDir, "css/");

// function that returns the full name from the srcDir
const sourceName = name => path.join(srcDir, name);

// src dirs
const pcssSrcDirs = ["pcss/", "view/", "elem/"].map(sourceName);
const tmplSrcDirs = ["view/"].map(sourceName);

// we route the command to the appropriate function
router({ _default, app, lib, css, tmpl, watch }).route();

// --------- Command Functions --------- //
async function _default() {
	await lib();
	await app();
	await tmpl();
	await css();
}

async function app() {
	var start = now();
	ensureDist();

	var dist = path.join(webDir, "js/app-bundle.js");
	var entries = await fs.listFiles(srcDir, ".ts");
	// var entries = await fs.listFiles(jsSrcDirs, ".ts");	
	try {
		await rollupFiles(entries, dist, {
			ts: true,
			tsconfig: path.join(rootDir, "tsconfig.json"),
			globals: {
				"d3": "window.d3",
				"mvdom": "window.mvdom",
				"handlebars": "window.Handlebars"
			}
		});
	} catch (ex) {
		console.log("BUILD ERROR - something when wrong on rollup\n\t" + ex);
		console.log("Empty string was save to the app bundle");
		console.log("Trying saving again...");
		return;
	}

	await printLog("Rollup", dist, start);
}

async function lib() {
	var start = now();
	ensureDist();

	var dist = path.join(webDir, "js/lib-bundle.js");
	var entries = [path.join(srcDir, "lib-bundle.js")];

	await rollupFiles(entries, dist, { ts: false });

	await printLog("Rollup", dist, start);
}

async function css() {
	var start = now();
	ensureDist();

	var dist = path.join(cssDistDir, "all-bundle.css");
	await pcssFiles(await fs.listFiles(pcssSrcDirs, ".pcss"), dist);

	await printLog("postCSS", dist, start);
}

async function tmpl() {
	var start = now();
	ensureDist();

	var dist = path.join(webDir, "js/templates.js");
	await tmplFiles(await fs.listFiles(tmplSrcDirs, ".tmpl"), dist);

	await printLog("Template", dist, start);
}


async function watch() {
	// first we build all
	await _default();

	// NOTE: here we do not need to do await (even if we could) as it is fine to not do them sequentially. 

	fs.watchDirs([srcDir], ".ts", () => app());

	fs.watchDirs(pcssSrcDirs, ".pcss", () => css());

	fs.watchDirs(tmplSrcDirs, ".tmpl", () => tmpl());

}
// --------- /Command Functions --------- //


// --------- Utils --------- //
// make sure the dist folder exists
function ensureDist() {
	fs.ensureDirSync(jsDistDir);
	fs.ensureDirSync(cssDistDir);
}

// return now in milliseconds using high precision
function now() {
	var hrTime = process.hrtime();
	return hrTime[0] * 1000 + hrTime[1] / 1000000;
}

async function printLog(txt, dist, start) {
	var size = (await fs.stat(dist)).size;
	size = Math.round(size / 1000.0);

	console.log(txt + " - " + dist + " - " + Math.round(now() - start) + "ms - " + size + "kb");
}
// --------- /Utils --------- //