#!/usr/bin/env node

var fs = require("fs"),
	path = require("path"),
	exec = require("child_process").exec
;

console.log("*** Building Core ***");
console.log("Minifying to asq.js.");

exec("node_modules/.bin/uglifyjs asq.src.js --comments '/^\!/' --mangle --compress --output asq.js",function(){
	// ensure trailing new-line
	fs.appendFileSync(path.join(__dirname,"asq.js"),"\n");

	console.log("Complete.");
});
