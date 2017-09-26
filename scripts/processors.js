const path = require("path");
const fs = require("fs-extra-plus");

//////// for Postcss
const postcss = require("postcss");
const processors = [
	require("postcss-import"),
	require("postcss-mixins"),
	require("postcss-simple-vars"),
	require("postcss-nested"),
	require("postcss-cssnext")({ browsers: ["last 2 versions"] })
];

/////// for JS
const rollup = require('rollup');
const rollup_cjs = require('rollup-plugin-commonjs');
const rollup_re = require('rollup-plugin-node-resolve');
const rollup_ts = require('rollup-plugin-typescript2');
// Latest rollup-plugin-multi does not work with latest rollup, but pull request worked (https://github.com/rollup/rollup-plugin-multi-entry/pull/23)
// so, this is the temporary patched version
const rollup_multi = require('./rollup-plugin-multi-entry-patched');


/////// for handlebars
const hbsPrecompile = require("hbsp").precompile; // promise style


module.exports = {
	tmplFiles,
	pcssFiles,
	rollupFiles,
};


// --------- For Handlebars --------- //
async function tmplFiles(files, distFile) {

	await fs.unlinkFiles([distFile]);

	var templateContent = [];

	for (let file of files) {

		let htmlTemplate = await fs.readFile(file, "utf8");
		let template = await hbsPrecompile(file, htmlTemplate);
		templateContent.push(template);
	}

	await fs.writeFile(distFile, templateContent.join("\n"), "utf8");
}
// --------- /For Handlebars --------- //

// --------- For postCss --------- //
async function pcssFiles(entries, distFile) {

	try {
		var mapFile = distFile + ".map";
		await fs.unlinkFiles([distFile, mapFile]);

		var processor = postcss(processors);
		var pcssNodes = [];

		// we parse all of the .pcss files
		for (let srcFile of entries) {
			// read the file
			let pcss = await fs.readFile(srcFile, "utf8");

			var pcssNode = postcss.parse(pcss, {
				from: srcFile
			});
			pcssNodes.push(pcssNode);
		}

		// build build the combined rootNode and its result
		var rootNode = null;
		for (let pcssNode of pcssNodes) {
			rootNode = (rootNode) ? rootNode.append(pcssNode) : pcssNode;
		}
		var rootNodeResult = rootNode.toResult();

		// we process the rootNodeResult
		var pcssResult = await processor.process(rootNodeResult, {
			to: distFile,
			map: { inline: false }
		});
	} catch (ex) {
		console.log(`postcss ERROR - Cannot process ${distFile} because (setting css empty file) \n${ex}`);
		// we write the .css and .map files
		await fs.writeFile(distFile, "", "utf8");
		await fs.writeFile(mapFile, "", "utf8");
		return;
	}

	// we write the .css and .map files
	await fs.writeFile(distFile, pcssResult.css, "utf8");
	await fs.writeFile(mapFile, pcssResult.map, "utf8");
}
// --------- /For postCss --------- //


// --------- For Rollup (JavaScript) --------- //
var defaultOpts = {
	ts: true
};

/**
 * 
 * @param {*} entries 
 * @param {*} distFile 
 * @param {*} opts 
 *    - ts?: boolean - (default true)
 *    - globals?: {importName: globalName} - (default undefined) define the list of global names (assumed to be mapped to window._name_)
 */
async function rollupFiles(entries, distFile, opts) {
	opts = Object.assign({}, defaultOpts, opts);

	await fs.remove("./.rpt2_cache");

	// delete the previous ouutput files
	var mapFile = distFile + ".map";
	await fs.unlinkFiles([distFile, mapFile]);

	// set the default rollup input options
	const inputOptions = {
		input: entries,
		plugins: [rollup_multi(), rollup_cjs(), rollup_re()]
	};

	// set the default rollup output options
	// make the name from file name "web/js/lib-bundle.js" : "lib_bundle"
	var name = path.parse(distFile).name.replace(/\W+/g, "_");
	const outputOptions = {
		file: distFile,
		format: 'iife',
		name: name,
		sourcemap: true,
		sourcemapFile: mapFile
	};

	// if ts, then, we add the rollup_ts plugin
	if (opts.ts || opts.tsconfig) {
		let tsOpts = {
			clean: true
		};
		if (opts.tsconfig) {
			tsOpts.tsconfig = opts.tsconfig;
		}
		// Note: if we do not have clean:true, we get some exception when watch.
		inputOptions.plugins.push(rollup_ts(tsOpts));
	}

	// if we have some globals, we add them accordingly
	if (opts.globals) {
		// for input, just set the external (clone to be safe(r))
		inputOptions.external = Object.keys(opts.globals);
		outputOptions.globals = opts.globals;
	}

	try {
		// bundle
		const bundle = await rollup.rollup(inputOptions);

		// write
		await bundle.write(outputOptions);

		// make sure the .rpt2_cache/ folder is delete (apparently, clean:true does not work)
		//await fs.remove("./.rpt2_cache");
	} catch (ex) {
		// make sure we write nothing in the file, to know nothing got compiled
		await fs.writeFile(distFile, "", "utf8");
		throw ex;
	}
}
// --------- /For Rollup (JavaScript) --------- //


