// "runner"
ASQ.extend("runner",function __extend__(api,internals){
	return function __runner__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var co_runs = ARRAY_SLICE.call(arguments);

		api
		.then(function __then__(mainDone){
			var msgs = ARRAY_SLICE.call(arguments,1), msgs2;
			var run, ret;

			// map co-routines to round-robin list of iterators
			co_runs = co_runs.map(function(fn){
				var it = fn;

				// generator function?
				if (typeof fn === "function" &&
					fn.constructor &&
					fn.constructor.name === "GeneratorFunction"
				) {
					// initialize the generator (passing in
					// value-messages, if any)
					it = fn.apply(ø,msgs);
					msgs = [];
				}
				// not an iterable sequence? wrap it.
				else if (!(
					ASQ.isSequence(fn) && "next" in fn
				)) {
					msgs2 = msgs.slice();
					msgs = [];
					it = ASQ.iterable()
					.val(function(){
						return fn.apply(ø,msgs2);
					});
				}

				// listen for any sequence failures
				if (ASQ.isSequence(it)) {
					it.or(function(){
						// signal iteration-error
						mainDone.fail.apply(ø,arguments);
					});
				}

				return it;
			});

			// async iteration of round-robin list
			(function iterate(){
				// round-robin: run top co-routine in list
				run = co_runs.shift();

				// process the iteration
				try {
					ret = run.next.apply(run,msgs);
				}
				catch (err) {
					return mainDone.fail(err);
				}

				// not a recognized ASQ instance returned?
				if (!ASQ.isSequence(ret.value)) {
					// received a standard promise-thennable back?
					// wrap it in a sequence.
					// NOTE: `then` duck-typing of promises is stupid.
					if (
						ret.value !== null &&
						(
							typeof ret.value === "object" ||
							typeof ret.value === "function"
						) &&
						"then" in ret.value
					) {
						ret.value = ASQ().promise(ret.value);
					}
					// otherwise, assume immediate value received, so
					// wrap it in a sequence.
					else {
						ret.value = ASQ.apply(ø,(typeof ret.value !== "undefined") ? [ret.value] : []);
					}
				}

				ret.value
				.val(function(){
					if (arguments.length > 0) {
						// save any return messages for input
						// to next iteration
						msgs = ARRAY_SLICE.call(arguments);
					}

					// still more to iterate?
					if (!ret.done) {
						// round-robin: insert co-routine back
						// in at end of list
						co_runs.push(run);
					}

					// still have some co-routine runs to process?
					if (co_runs.length > 0) {
						iterate();
					}
					// signal done with all co-routine runs
					else {
						// note: use most recent `msgs` value now that
						// iteration is complete
						mainDone.apply(ø,msgs);
					}
				})
				.or(function(){
					// if an error occurs in the step-continuation
					// promise or sequence, throw it back into the
					// generator or iterable-sequence
					run["throw"].apply(ø,arguments);
				});
			})();
		});

		return api;
	};
});
