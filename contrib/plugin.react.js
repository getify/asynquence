// "react" (reactive sequences)
ASQ.react = function __react__(setup) {
	var template, teardowns = [];

	function proceed() {
		if (template) {
			var sq = template.duplicate();
			sq.unpause.apply(ø,arguments);
			return sq;
		}
		return ASQ().val(function __val__(){ throw "Disabled Sequence"; });
	}

	proceed.onStream = function onStream() {
		ARRAY_SLICE.call(arguments)
		.forEach(function $forEach$(stream){
			stream.on("data",proceed);
			stream.on("error",proceed);
		});
	};

	proceed.unStream = function unStream() {
		ARRAY_SLICE.call(arguments)
		.forEach(function $forEach$(stream){
			stream.removeListener("data",proceed);
			stream.removeListener("error",proceed);
		});
	};

	function teardown() {
		if (template) {
			template = null;
			teardowns.forEach(function __forEach__(fn){ fn(); });
			teardowns.length = 0;
		}
	}

	function registerTeardown(fn) {
		if (template && typeof fn === "function") {
			teardowns.push(fn);
		}
	}

	// make sure `fn(..)` is called async
	ASQ(function __asq__(){
		setup.call(template,proceed,registerTeardown);
	});

	template = ASQ().duplicate();
	template.stop = teardown;
	return template;
};
