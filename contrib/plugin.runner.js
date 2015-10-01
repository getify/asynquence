// "runner"
ASQ.extend("runner",function $$extend(api,internals){

	return function $$runner() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var args = ARRAY_SLICE.call(arguments);

		api
		.then(function $$then(mainDone){

			function wrap(v) {
				// function? expected to produce an iterator
				// (like a generator) or a promise
				if (typeof v === "function") {
					// call function passing in the control token
					// note: neutralize `this` in call to prevent
					// unexpected behavior
					v = v.call(ø,token);

					// promise returned (ie, from async function)?
					if (isPromise(v)) {
						// wrap it in iterable sequence
						v = ASQ.iterable(v);
					}
				}
				// an iterable sequence? duplicate it (in case of multiple runs)
				else if (ASQ.isSequence(v) && "next" in v) {
					v = v.duplicate();
				}
				// wrap anything else in iterable sequence
				else {
					v = ASQ.iterable(v);
				}

				// a sequence to tap for errors?
				if (ASQ.isSequence(v)) {
					// listen for any sequence failures
					v.or(function $$or(){
						// signal iteration-error
						mainDone.fail.apply(ø,arguments);
					});
				}

				return v;
			}

			function addWrapped() {
				iterators.push.apply(
					iterators,
					ARRAY_SLICE.call(arguments).map(wrap)
				);
			}

			function iterateOrQuit(iterFn,now) {
				// still have some co-routine runs to process?
				if (iterators.length > 0) {
					if (now) iterFn();
					else schedule(iterFn);
				}
				// all done!
				else {
					// previous value message?
					if (typeof next_val !== "undefined") {
						// not a message wrapper array?
						if (!ASQ.isMessageWrapper(next_val)) {
							// wrap value for the subsequent `apply(..)`
							next_val = [next_val];
						}
					}
					else {
						// nothing to affirmatively pass along
						next_val = [];
					}

					// signal done with all co-routine runs
					mainDone.apply(ø,next_val);
				}
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
				// get next co-routine in list
				iter = iterators.shift();

				// process the iteration
				try {
					// multiple messages to send to an iterable
					// sequence?
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

				// bail on run in aborted sequence
				if (internals("seq_aborted")) return;

				// was the control token yielded?
				if (ret.value === token) {
					// round-robin: put co-routine back into the list
					// at the end where it was so it can be processed
					// again on next loop-iteration
					if (!ret.done) {
						iterators.push(iter);
					}
					next_val = token;
					iterateOrQuit(iterate,/*now=*/false);
				}
				else {
					// not a recognized ASQ instance returned?
					if (!ASQ.isSequence(ret.value)) {
						// received a thenable/promise back?
						if (isPromise(ret.value)) {
							// wrap in a sequence
							ret.value = ASQ().promise(ret.value);
						}
						// thunk yielded?
						else if (typeof ret.value === "function") {
							// wrap thunk call in a sequence
							var fn = ret.value;
							ret.value = ASQ(function $$ASQ(done){
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
					.val(function $$val(){
						// bail on run in aborted sequence
						if (internals("seq_aborted")) return;

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
								// at the end, so that the the next iterator can be
								// processed on next loop-iteration
								iterators.push(iter);
							}
							else {
								// put co-routine back in where it just
								// was so it can be processed again on
								// next loop-iteration
								iterators.unshift(iter);
							}
						}

						iterateOrQuit(iterate,/*now=*/true);
					})
					.or(function $$or(){
						// bail on run in aborted sequence
						if (internals("seq_aborted")) return;

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
