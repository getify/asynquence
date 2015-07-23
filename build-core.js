#!/usr/bin/env node

var fs = require("fs"),
	path = require("path"),
	ugly = require("uglify-js"),

	result
;

console.log("*** Building Core ***");
console.log("Minifying to asq.js.");

try {
	result = ugly.minify(path.join(__dirname,"asq.src.js"),{
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
		path.join(__dirname,"asq.js"),
		result.code + "\n",
		{ encoding: "utf8" }
	);

	console.log("Complete.");
}
catch (err) {
	console.error(err);
	process.exit(1);
}
