#!/usr/bin/env node

// bundle the contrib plugins
function bundlePlugins(dir) {
	var files = fs.readdirSync(dir);

	files.forEach(function(file){
		var st = fs.statSync(path.join(dir,file)),
			contents, collection_id
		;

		// template file to read contents and compile?
		if (st.isFile() && /^plugin\..*\.js$/.test(file)) {
			console.log("Bundling plugin: " + file);

			bundle_str += fs.readFileSync(path.join(dir,file),{ encoding: "utf8" });
		}
		else if (st.isDirectory()) {
			bundlePlugins(path.join(dir,file));
		}
	});
}

var path = require("path"),
	fs = require("fs"),

	bundle_str = "",

	bundle_wrapper = fs.readFileSync(path.join(__dirname,"contrib-wrapper.js"),{ encoding: "utf8" })
;

console.log("*** Bundling contrib plugins ***");

bundlePlugins(
	/*dir=*/path.join(__dirname)
);

bundle_wrapper = bundle_wrapper.replace(/\/\*PLUGINS\*\//,function(){ return bundle_str; });

fs.writeFileSync(
	path.join(__dirname,"..","contrib.src.js"),
	bundle_wrapper,
	{ encoding: "utf8" }
);

console.log("Built contrib.src.js bundle.")
console.log("Minifying to contrib.js.");

var exec = require("child_process").exec;

exec("node_modules/.bin/uglifyjs contrib.src.js --comments '/^\!/' --mangle --compress --output contrib.js");

console.log("Complete.");
