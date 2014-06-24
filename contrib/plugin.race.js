// "race"
ASQ.extend("race",function __extend__(api,internals){
	return function __race__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments)
		.map(function __map__(fn){
			var def;
			// tap any directly-provided sequences immediately
			if (ASQ.isSequence(fn)) {
				def = { fn: fn };
				tapSequence(def);
				return function __fn__(done) {
					def.fn.pipe(done);
				};
			}
			else return fn;
		});

		api.then(function __then__(done){
			var args = ARRAY_SLICE.call(arguments);

			fns.forEach(function __forEach__(fn){
				fn.apply(ø,args);
			});
		});

		return api;
	};
});
