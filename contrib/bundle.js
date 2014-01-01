#!/usr/bin/env node

// bundle the contrib plugins
function bundlePlugins(dir) {
	var files = fs.readdirSync(dir);

	files.forEach(function(file){
		var st = fs.statSync(path.join(dir,file)),
			contents, collection_id,
			plugin_name = file.replace(/plugin\.(.*)\.js/,"$1").toLowerCase()
		;

		// template file to read contents and compile?
		if (st.isFile() && /^plugin\..*\.js$/.test(file) &&
			(
				!which_plugins ||
				~which_plugins.indexOf(plugin_name)
			)
		) {
			console.log("Bundling plugin: " + plugin_name);

			bundle_str += fs.readFileSync(path.join(dir,file),{ encoding: "utf8" });
		}
		else if (st.isDirectory() && !/node_modules/.test(file)) {
			bundlePlugins(path.join(dir,file));
		}
	});
}

var path = require("path"),
	fs = require("fs"),
	exec = require("child_process").exec,
	ugly = require("uglify-js"),

	bundle_str = "",

	bundle_wrapper = fs.readFileSync(path.join(__dirname,"contrib-wrapper.js"),{ encoding: "utf8" }),

	which_plugins = process.argv.length > 2 ?
		process.argv.slice(2) :
		null
;

if (which_plugins) {
	which_plugins = which_plugins.map(function(plugin){
		return plugin.toLowerCase();
	});
}

console.log("*** Bundling contrib plugins ***");

bundlePlugins(
	/*dir=*/path.join(__dirname)
);

bundle_wrapper = bundle_wrapper.replace(/\/\*PLUGINS\*\//,function(){ return bundle_str; });

fs.writeFileSync(
	path.join(__dirname,"contrib.src.js"),
	bundle_wrapper,
	{ encoding: "utf8" }
);

console.log("Built contrib.src.js.");
console.log("Minifying to contrib.js.");

try {
	result = ugly.minify(path.join(__dirname,"contrib.src.js"),{
		mangle: true,
		compress: true,
		output: {
			comments: /^!/
		}
	});

	fs.writeFileSync(
		path.join(__dirname,"contrib.js"),
		result.code + "\n",
		{ encoding: "utf8" }
	);

	console.log("Complete.");
}
catch (err) {
	console.error(err);
	process.exit(1);
}
