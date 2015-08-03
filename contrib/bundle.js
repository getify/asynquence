#!/usr/bin/env node

var path = require("path"),
	fs = require("fs"),
	ugly = require("uglify-js"),
	args = require("minimist")(
		process.argv.slice(2),
		{
			"boolean": ["keep-es6"],
			"string": ["wrapper","bundle","min-bundle","exclude"]
		}
	),
	testify = require("es-feature-tests/testify"),
	babel = require("babel-core"),

	bundle_name = "contrib.src.js",
	bundle_min_name = "contrib.js",
	bundle_wrapper_name = "contrib-wrapper.js",

	bundle_wrapper_code,
	bundle_str = "",
	which_plugins,
	exclude_plugins
;

// **********************************************

// want help?
if (args.help) {
	printHelp();
	process.exit(1);
}

// pull in any override options
if (args.bundle) {
	bundle_name = args.bundle;
}
if (args["min-bundle"]) {
	bundle_min_name = args["min-bundle"];
}
if (args.wrapper) {
	bundle_wrapper_name = args.wrapper;
}

if (args._.length > 0) {
	which_plugins = args._.slice();
}
if (args.exclude && args.exclude.length > 0) {
	exclude_plugins = Array.isArray(args.exclude) ? args.exclude.slice() : [args.exclude];
}

bundlePlugins(
	/*dir=*/path.join(__dirname)
);

bundle_wrapper_code = fs.readFileSync(
	path.join(__dirname,bundle_wrapper_name),
	{ encoding: "utf8" }
);

bundle_wrapper_code = bundle_wrapper_code.replace(/\/\*PLUGINS\*\//,function $$replace(){ return bundle_str; });

fs.writeFileSync(
	path.join(__dirname,bundle_name),
	bundle_wrapper_code,
	{ encoding: "utf8" }
);

console.log("Bundling complete.");

if (!args["keep-es6"]) {
	console.log("Minifying to: " + bundle_min_name);

	try {
		result = ugly.minify(path.join(__dirname,bundle_name),{
			mangle: {
				keep_fnames: true
			},
			compress: {
				keep_fnames: true
			},
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
}

function printHelp() {
	console.log("bundle.js usage:");
	console.log("  bundle.js [ {OPTION} .. ] [ {PLUGIN-NAME} .. ]");
	console.log("");
	console.log("--help                    prints this help");
	console.log("--wrapper=filename        wrapper filename (\"contrib-wrapper.js\")");
	console.log("--bundle=filename         bundle filename (\"contrib.src.js\")");
	console.log("--min-bundle=filename     minified-bundle filename (\"contrib.js\")");
	console.log("--exclude={PLUGIN-NAME}   exclude a plugin from bundling");
	console.log("--keep-es6={PLUGIN-NAME}  no ES6 transpilation, skips minification");
	console.log("");
	console.log("If you don't pass any {PLUGIN-NAME} parameters, all available plugins");
	console.log("(except any that are --exclude omitted) will be bundled.");
	console.log("");
	console.log("If you pass one or more {PLUGIN-NAME} parameters, only the ones");
	console.log("specified (except any that are --exclude omitted) will be bundled.");
	console.log("");
}

function checkES6(text) {
	var tests_needed = testify.scan({
		content: text
	});

	if (tests_needed.length > 0) {
		text = babel.transform(text,{
			ast: false,
			compact: false
		}).code;
	}

	return text;
}

// bundle the contrib plugins
function bundlePlugins(dir) {
	var files = fs.readdirSync(dir);

	files.sort();

	files.forEach(function $$each(file){
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
			if (!exclude_plugins ||
				!~exclude_plugins.indexOf(plugin_name)
			) {
				console.log("Including plugin: " + plugin_name);

				contents = fs.readFileSync(path.join(dir,file),{ encoding: "utf8" });
				if (!args["keep-es6"]) {
					contents = checkES6(contents);
				}

				bundle_str += contents;
			}
			else {
				console.log(" (excluding): " + plugin_name);
			}

			// remove plugin from specified list
			if (which_plugins && ~which_plugins.indexOf(plugin_name)) {
				which_plugins.splice(which_plugins.indexOf(plugin_name),1);
			}
			if (exclude_plugins && ~exclude_plugins.indexOf(plugin_name)) {
				exclude_plugins.splice(exclude_plugins.indexOf(plugin_name),1);
			}
		}
		else if (st.isDirectory() && !/node_modules/.test(file)) {
			bundlePlugins(path.join(dir,file));
		}
	});

	if (which_plugins && which_plugins.length > 0) {
		console.error("** Warning ** Requested plugins not found: " + which_plugins.join(" "));
	}
	if (exclude_plugins && exclude_plugins.length > 0) {
		console.error("** Warning ** Excluded plugins not found: " + exclude_plugins.join(" "));
	}
}
