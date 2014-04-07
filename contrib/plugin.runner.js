// "runner"
ASQ.extend("runner",function __extend__(api,internals){
	return function __runner__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		ARRAY_SLICE.call(arguments)
		.forEach(function __forEach__(fn){
			api
			.then(function __then__(mainDone){
				var msgs = ARRAY_SLICE.call(arguments,1), it = fn;

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
					it = ASQ.iterable()
					.val(function(){
						return fn.apply(ø,msgs);
					});
				}

				// listen for any sequence failures
				if (ASQ.isSequence(it)) {
					it.or(function(){
						// signal iteration-error
						mainDone.fail.apply(ø,arguments);
					});
				}

				// async iteration over sequence/generator
				(function iterate(){
					var ret;

					// process the iteration
					try {
						ret = it.next.apply(it,msgs);
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
							ret.value = ASQ(ret.value);
						}
					}

					ret.value
					.val(function(){
						// still more to iterate?
						if (!ret.done) {
							// save any return messages for input
							// to next iteration
							msgs = ARRAY_SLICE.call(arguments);
							iterate();
						}
						else {
							// signal iteration-complete.
							// note: use most recent `msgs` value now that
							// iteration is complete, since `ret.value`
							// will be empty
							mainDone.apply(ø,msgs);
						}
					})
					.or(function(){
						// if an error occurs in the step-continuation
						// promise or sequence, throw it back into the
						// generator or iterable-sequence
						it.throw.apply(ø,arguments);
					});
				})();
			});
		});

		return api;
	};
});
