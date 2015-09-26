// "react" (reactive sequences)
ASQ.react = function $$react(reactor) {
	function next() {
		if (!paused) {
			if (template) {
				var sq = template.duplicate();
				sq.unpause.apply(ø,arguments);
				return sq;
			}
			return ASQ(function $$asq(){ throw "Disabled Sequence"; });
		}
	}

	function registerTeardown(fn) {
		if (template && typeof fn === "function") {
			teardowns.push(fn);
		}
	}

	var template = ASQ().duplicate(),
		teardowns = [], paused = false
	;

	// add reactive sequence kill switch
	template.stop = function $$stop() {
		if (template) {
			template = null;
			teardowns.forEach(Function.call,Function.call);
			teardowns.length = 0;
		}
	};

	template.pause = function $$pause() {
		if (!paused && template) {
			paused = true;
			teardowns.forEach(Function.call,Function.call);
			teardowns.length = 0;
		}
	};

	template.resume = function $$resume() {
		if (paused && template) {
			paused = false;
			reactor.call(template,next,registerTeardown);
		}
	};

	template.push = next;

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
