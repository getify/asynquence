// "react" (reactive sequences)
ASQ.react = function __react__(setup) {
	var template, teardowns = [];

	function proceed() {
		if (template) {
			var sq = template.duplicate();
			sq.unpause.apply(ø,arguments);
			return sq;
		}
		return ASQ().val(function(){ throw "Disabled Sequence"; });
	}

	function teardown() {
		if (template) {
			template = null;
			teardowns.forEach(function(fn){ fn(); });
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
