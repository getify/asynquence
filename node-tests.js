#!/usr/bin/env node

function doneLogMsg(msg) {
	return function() {
		console.log(msg);
	};
}

var ASQ = require("./asq.src.js");
var Q = require("q");
var tests = require("./tests.js")(doneLogMsg);
tests.Q = Q; // inject Q so the tests can use it
var path = require("path");
var fs = require("fs");
var child_process = require("child_process");
var contrib_tests_file = path.join(__dirname,"contrib","node-tests.js");
var contrib_tests = [function(done){
	console.log("*** CONTRIB TESTS SKIPPED ***");
	done();
}];


// if `./contrib/` exists, run the contrib test suite
if (fs.existsSync(contrib_tests_file)) {
	contrib_tests = [function __contrib_tests__(done) {
		console.log("");
		var cp = child_process.spawn(
			contrib_tests_file,
			/*args=*/[],
			{
				cwd: path.join(__dirname,"contrib"),
				env: process.env,
				encoding: "utf8"
			}
		);

		cp.stdout.on("data",function(data){
			console.log(data.toString().replace(/\n$/,""));
		});
		cp.stderr.on("data",function(data){
			console.error(data.toString().replace(/\n$/,""));
		});
		cp.on("close",function(code){
			if (code === 0) {
				done();
			}
			else {
				done.fail();
			}
		});
	}];
}


console.log("asynquence test suite");

ASQ.apply(ASQ,tests)
.val(doneLogMsg("ALL CORE TESTS PASSED!"))
.then.apply(ASQ,contrib_tests) // contrib tests, if any
.val(doneLogMsg("\nALL TESTS PASSED!"))
.or(function(){
	doneLogMsg("*** TEST SUITE FAILURE ***")();
	for (var i=0; i<arguments.length; i++) {
		doneLogMsg(arguments[i] +
			(arguments[i] && arguments[i].stack ? arguments[i].stack : "")
		)();
	}
	process.exit(1); // non-zero exit code!
});
