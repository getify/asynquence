// "race"
ASQ.extend("race",function $$extend(api,internals){
	return function $$race() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments)
		.map(function $$map(v){
			var def;
			// tap any directly-provided sequences immediately
			if (ASQ.isSequence(v)) {
				def = { seq: v };
				tapSequence(def);
				return function $$fn(done) {
					def.seq.pipe(done);
				};
			}
			else return v;
		});

		api.then(function $$then(done){
			var args = ARRAY_SLICE.call(arguments);

			fns.forEach(function $$each(fn){
				fn.apply(ø,args);
			});
		});

		return api;
	};
});
