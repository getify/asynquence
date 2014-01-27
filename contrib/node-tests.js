#!/usr/bin/env node

function doneLogMsg(msg) {
	return function() {
		console.log(msg);
	};
}

var ASQ = require("asynquence");
var path = require("path");
require(path.join(__dirname,"contrib.src.js"));
var Q = require("q");
var tests = require(path.join(__dirname,"tests.js"))(doneLogMsg);
tests.Q = Q; // inject Q so the tests can use it

console.log("asynquence-contrib test suite");

ASQ.apply(ASQ,tests)
.val(doneLogMsg("ALL CONTRIB TESTS PASSED!"))
.or(function(){
	doneLogMsg("*** TEST SUITE FAILURE ***")();
	for (var i=0; i<arguments.length; i++) {
		doneLogMsg(arguments[i] +
			(arguments[i] && arguments[i].stack ? arguments[i].stack : "")
		)();
	}
	process.exit(1); // non-zero exit code!
});
