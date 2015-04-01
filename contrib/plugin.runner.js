// "runner"
ASQ.extend("runner",function __extend__(api,internals){
	return function __runner__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var args = ARRAY_SLICE.call(arguments);

		api
		.then(function __then__(mainDone){

			function wrap(fn){
				var it = fn;

				// function? expected to produces an iterator
				// (like a generator)
				if (typeof fn === "function") {
					// retrieve the iterator, passing in
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
					it.or(function __or__(){
						// signal iteration-error
						mainDone.fail.apply(ø,arguments);
					});
				}

				return it;
			}

			function addWrapped() {
				iterators.push.apply(
					iterators,
					ARRAY_SLICE.call(arguments).map(wrap)
				);
			}

			var iterators = args,
				token = {
					messages: ARRAY_SLICE.call(arguments,1),
					add: addWrapped
				},
				iter, ret, next_val = token
			;

			// map co-routines to round-robin list of iterators
			iterators = iterators.map(wrap);

			// async iteration of round-robin list
			(function iterate(){
				var val_type, fn;

				// round-robin: run top co-routine in list
				iter = iterators.shift();

				// process the iteration
				try {
					if (ASQ.isMessageWrapper(next_val) &&
						ASQ.isSequence(iter)
					) {
						ret = iter.next.apply(iter,next_val);
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
					schedule(iterate); // async recurse
				}
				else {
					// not a recognized ASQ instance returned?
					if (!ASQ.isSequence(ret.value)) {
						val_type = typeof ret.value;
						// received a thenable/promise back?
						// NOTE: `then` duck-typing of promises is stupid.
						if (
							ret.value !== null &&
							(
								val_type === "object" ||
								val_type === "function"
							) &&
							typeof ret.value.then === "function"
						) {
							// wrap the promise in a sequence
							ret.value = ASQ().promise(ret.value);
						}
						// thunk yielded?
						else if (val_type === "function") {
							// wrap thunk call in a sequence
							fn = ret.value;
							ret.value = ASQ(function __ASQ__(done){
								fn(done.errfcb);
							});
						}
						// message wrapper returned?
						else if (ASQ.isMessageWrapper(ret.value)) {
							// wrap message(s) in a sequence
							ret.value = ASQ.apply(ø,
								// don't let `apply(..)` discard an empty message
								// wrapper! instead, pass it along as its own value
								// itself.
								ret.value.length > 0 ? ret.value : ASQ.messages(undefined)
							);
						}
						// non-undefined value returned?
						else if (typeof ret.value !== "undefined") {
							// wrap the value in a sequence
							ret.value = ASQ(ret.value);
						}
						else {
							// make an empty sequence
							ret.value = ASQ();
						}
					}

					ret.value
					.val(function __val__(){
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
					.or(function __or__(){
						try {
							// if an error occurs in the step-continuation
							// promise or sequence, throw it back into the
							// generator or iterable-sequence
							iter["throw"].apply(iter,arguments);
						}
						catch (err) {
							// if an error comes back out of after the throw,
							// pass it out to the main sequence, as iteration
							// must now be complete
							mainDone.fail(err);
						}
					});
				}
			})();
		});

		return api;
	};
});
