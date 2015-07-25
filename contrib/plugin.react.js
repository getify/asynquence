// "react" (reactive sequences)
ASQ.react = function $$react(reactor) {
	function next() {
		if (template) {
			var sq = template.duplicate();
			sq.unpause.apply(ø,arguments);
			return sq;
		}
		return ASQ(function $$asq(){ throw "Disabled Sequence"; });
	}

	function registerTeardown(fn) {
		if (template && typeof fn === "function") {
			teardowns.push(fn);
		}
	}

	var template = ASQ().duplicate(),
		teardowns = []
	;

	// add reactive sequence kill switch
	template.stop = function $$stop() {
		if (template) {
			template = null;
			teardowns.forEach(Function.call,Function.call);
			teardowns.length = 0;
		}
	};

	next.onStream = function $$onStream() {
		ARRAY_SLICE.call(arguments)
		.forEach(function $$each(stream){
			stream.on("data",next);
			stream.on("error",next);
		});
	};

	next.unStream = function $$unStream() {
		ARRAY_SLICE.call(arguments)
		.forEach(function $$each(stream){
			stream.removeListener("data",next);
			stream.removeListener("error",next);
		});
	};

	// make sure `reactor(..)` is called async
	ASQ.__schedule(function $$schedule(){
		reactor.call(template,next,registerTeardown);
	});

	return template;
};
