#!/usr/bin/env node

function doneLogMsg(msg) {
	return function() {
		console.log(msg);
	};
}

var ASQ = require("./asq.src.js");
var tests = require("./tests.js")(doneLogMsg);
var contrib_tests = require("./contrib/tests.js")(doneLogMsg);

console.log("asynquence test suite");

ASQ.apply(ASQ,tests)
.val(doneLogMsg("ALL CORE TESTS PASSED!"))
.val(function(){
	// add the extension plugins
	require("./contrib.src.js");
})
.then.apply(ASQ,contrib_tests)
.val(doneLogMsg("ALL CONTRIB TESTS PASSED!"))
.val(doneLogMsg("ALL TESTS PASSED!"))
.or(function(){
	doneLogMsg("*** TEST SUITE FAILURE ***")();
	for (var i=0; i<arguments.length; i++) {
		doneLogMsg(arguments[i] +
			(arguments[i] && arguments[i].stack ? arguments[i].stack : "")
		)();
	}
	process.exit(1); // non-zero exit code!
});
