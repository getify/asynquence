#!/usr/bin/env node

function printHelp() {
	console.log("bundle.js usage:");
	console.log("  bundle.js [ {OPTION} .. ] [ {PLUGIN-NAME} .. ]");
	console.log("");
	console.log("--help                    prints this help");
	console.log("--wrapper=filename        wrapper filename (\"contrib-wrapper.js\")");
	console.log("--bundle=filename         bundle filename (\"contrib.src.js\")");
	console.log("--min-bundle=filename     minified-bundle filename (\"contrib.js\")");
	console.log("");
}

// bundle the contrib plugins
function bundlePlugins(dir) {
	var files = fs.readdirSync(dir);

	files.forEach(function(file){
		var st = fs.statSync(path.join(dir,file)),
			contents, collection_id,
			plugin_name = file.replace(/plugin\.(.*)\.js/,"$1")
		;

		// template file to read contents and compile?
		if (st.isFile() && /^plugin\..*\.js$/.test(file) &&
			(
				!which_plugins ||
				~which_plugins.indexOf(plugin_name)
			)
		) {
			console.log("Including plugin: " + plugin_name);

			bundle_str += fs.readFileSync(path.join(dir,file),{ encoding: "utf8" });

			// remove plugin from specified list
			if (which_plugins) {
				which_plugins.splice(which_plugins.indexOf(plugin_name),1);
			}
		}
		else if (st.isDirectory() && !/node_modules/.test(file)) {
			bundlePlugins(path.join(dir,file));
		}
	});

	if (which_plugins && which_plugins.length > 0) {
		console.error("Requested plugins not found: " + which_plugins.join(" "));
	}
}

var path = require("path"),
	fs = require("fs"),
	ugly = require("uglify-js"),
	argv = require("minimist")(
		process.argv.slice(2),
		{ "string": ["wrapper","bundle","min-bundle"] }
	),

	bundle_name = "contrib.src.js",
	bundle_min_name = "contrib.js",
	bundle_wrapper_name = "contrib-wrapper.js",

	bundle_wrapper_code,
	bundle_str = "",
	which_plugins
;

// want help?
if (argv.help) {
	printHelp();
	process.exit(1);
}

// pull in any override options
if (argv.bundle) {
	bundle_name = argv.bundle;
}
if (argv["min-bundle"]) {
	bundle_min_name = argv["min-bundle"];
}
if (argv.wrapper) {
	bundle_wrapper_name = argv.wrapper;
}

if (argv._.length > 0) {
	which_plugins = argv._.slice();
}

console.log("Bundling plugins into: " + bundle_name);

bundlePlugins(
	/*dir=*/path.join(__dirname)
);

bundle_wrapper_code = fs.readFileSync(
	path.join(__dirname,bundle_wrapper_name),
	{ encoding: "utf8" }
);

bundle_wrapper_code = bundle_wrapper_code.replace(/\/\*PLUGINS\*\//,function(){ return bundle_str; });

fs.writeFileSync(
	path.join(__dirname,bundle_name),
	bundle_wrapper_code,
	{ encoding: "utf8" }
);

console.log("Bundling complete.");
console.log("Minifying to: " + bundle_min_name);

try {
	result = ugly.minify(path.join(__dirname,bundle_name),{
		mangle: true,
		compress: true,
		output: {
			comments: /^!/
		}
	});

	fs.writeFileSync(
		path.join(__dirname,bundle_min_name),
		result.code + "\n",
		{ encoding: "utf8" }
	);

	console.log("Complete.");
}
catch (err) {
	console.error(err);
	process.exit(1);
}
