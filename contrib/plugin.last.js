// "last"
ASQ.extend("last",function $$extend(api,internals){
	return function $$last() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments);

		api.then(function $$then(done){
			function reset() {
				finished = true;
				error_messages.length = 0;
				success_messages = null;
			}

			function complete(trigger) {
				if (success_messages != null) {
					// last successful segment's message(s) sent
					// to main sequence to proceed as success
					trigger(
						success_messages.length > 1 ?
						ASQ.messages.apply(ø,success_messages) :
						success_messages[0]
					);
				}
				else {
					// send errors into main sequence
					error_messages.length = fns.length;
					trigger.fail.apply(ø,error_messages);
				}

				reset();
			}

			function success(trigger,idx,args) {
				if (!finished) {
					completed++;
					success_messages = args;

					// all segments complete?
					if (completed === fns.length) {
						finished = true;

						complete(trigger);
					}
				}
			}

			function failure(trigger,idx,args) {
				if (!finished &&
					!(idx in error_messages)
				) {
					completed++;
					error_messages[idx] =
						args.length > 1 ?
						ASQ.messages.apply(ø,args) :
						args[0]
					;
				}

				// all segments complete?
				if (!finished &&
					completed === fns.length
				) {
					finished = true;

					complete(trigger);
				}
			}

			var completed = 0, error_messages = [], finished = false,
				sq = ASQ.apply(ø,ARRAY_SLICE.call(arguments,1)),
				success_messages
			;

			wrapGate(sq,fns,success,failure,reset);

			sq.pipe(done);
		});

		return api;
	};
});
