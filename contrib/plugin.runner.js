// "runner"
ASQ.extend("runner",function __extend__(api,internals){
	return function __runner__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var routines = ARRAY_SLICE.call(arguments), token = {};

		api
		.then(function __then__(mainDone){
			var iterators, iter, ret, next_val = token;

			token.messages = ARRAY_SLICE.call(arguments,1);

			// map co-routines to round-robin list of iterators
			iterators = routines.map(function(fn){
				var it = fn;

				// generator function?
				if (typeof fn === "function" &&
					fn.constructor &&
					fn.constructor.name === "GeneratorFunction"
				) {
					// initialize the generator, passing in
					// the control token
					it = fn.call(ø,next_val);
				}
				// not an iterable sequence? wrap it.
				else if (!(
					ASQ.isSequence(fn) && "next" in fn
				)) {
					it = ASQ.iterable().val(fn);
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

			// forget original list of routines
			routines = null;

			// async iteration of round-robin list
			(function iterate(){
				var val_type;

				// round-robin: run top co-routine in list
				iter = iterators.shift();

				// process the iteration
				try {
					if (ASQ.isMessageWrapper(next_val) &&
						ASQ.isSequence(iter)
					) {
						ret = iter.next.apply(ø,next_val);
					}
					else {
						ret = iter.next(next_val);
					}
				}
				catch (err) {
					return mainDone.fail(err);
				}

				// was the control token yielded?
				if (ret.value === token) {
					// round-robin: put co-routine back into the list
					// at the end, so that the the next iterator where it was so it can be processed
					// again on next loop-iteration
					iterators.push(iter);
					next_val = token;
					ASQ(iterate); // async recurse
				}
				else {
					// not a recognized ASQ instance returned?
					if (!ASQ.isSequence(ret.value)) {
						// received a thenable back? wrap it in a sequence.
						// NOTE: `then` duck-typing of promises is stupid.
						val_type = typeof ret.value;
						if (
							ret.value !== null &&
							(
								val_type === "object" ||
								val_type === "function"
							) &&
							"then" in ret.value
						) {
							// wrap the promise in a sequence
							ret.value = ASQ().promise(ret.value);
						}
						// otherwise, assume immediate value received, so
						// wrap it in a sequence.
						else if (ASQ.isMessageWrapper(ret.value)) {
							ret.value = ASQ.apply(ø,ret.value);
						}
						else if (typeof ret.value !== "undefined") {
							ret.value = ASQ(ret.value);
						}
						else {
							ret.value = ASQ();
						}
					}

					ret.value
					.val(function(){
						if (arguments.length > 0) {
							// save any return messages for input
							// to next iteration
							next_val = arguments.length > 1 ?
								ASQ.messages.apply(ø,arguments) :
								arguments[0]
							;
						}

						// still more to iterate?
						if (!ret.done) {
							// was the control token passed along?
							if (next_val === token) {
								// round-robin: put co-routine back into the list
								// at the end, so that the the next iterator where it was so it can be processed
								// again on next loop-iteration
								iterators.push(iter);
							}
							else {
								// put co-routine back in where it just
								// was so it can be processed again on
								// next loop-iteration
								iterators.unshift(iter);
							}
						}

						// still have some co-routine runs to process?
						if (iterators.length > 0) {
							iterate(); // async recurse
						}
						// signal done with all co-routine runs
						else if (typeof next_val !== "undefined") {
							if (ASQ.isMessageWrapper(next_val)) {
								mainDone.apply(ø,next_val);
							}
							else {
								mainDone(next_val);
							}
						}
						else {
							mainDone();
						}
					})
					.or(function(){
						// if an error occurs in the step-continuation
						// promise or sequence, throw it back into the
						// generator or iterable-sequence
						iter["throw"].apply(ø,arguments);
					});
				}
			})();
		});

		return api;
	};
});
