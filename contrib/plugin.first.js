// "first"
ASQ.extend("first",function __extend__(api,internals){
	return function __first__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments);

		api.then(function __then__(mainDone){
			var completed = 0, error_messages = {}, success = false,
				sq = ASQ.apply(ø,ARRAY_SLICE.call(arguments,1))
			;

			fns = fns.map(function __map__(fn,idx){
				return function __segment__(done) {
					var args = ARRAY_SLICE.call(arguments);
					args[0] = function __done__() {
						if (!success) {
							success = true;
							completed++;

							// first successful segment triggers
							// main sequence to proceed as success
							mainDone(
								arguments.length > 1 ?
								ASQ.messages.apply(ø,arguments) :
								arguments[0]
							);

							// no longer need the inner gate
							sq.abort();
						}
					};
					args[0].fail = function __fail__() {
						var msgs = [];

						completed++;
						error_messages["s" + idx] =
							arguments.length > 1 ?
							ASQ.messages.apply(ø,arguments) :
							arguments[0]
						;

						// all segments complete without success?
						if (!success && completed === fns.length) {
							fns
							.forEach(function __foreach__(fn,i){
								msgs.push(error_messages["s" + i]);
							});

							// send errors into main sequence
							mainDone.fail.apply(ø,msgs);
						}
					};
					args[0].abort = function __abort__() {
						if (!success) {
							done.abort();
							mainDone.abort();
						}
					};

					fn.apply(ø,args);
				};
			});

			sq.gate.apply(ø,fns);
		});

		return api;
	};
});
