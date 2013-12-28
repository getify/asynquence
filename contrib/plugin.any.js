// "any"
ASQ.extend("any",function __extend__(api,internals){
	return function __any__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments);

		api.then(function __then__(mainDone){
			function checkGate() {
				var msgs;

				if (completed === fns.length) {
					msgs = [];

					if (success) {
						fns
						.forEach(function __foreach__(fn,i){
							msgs.push(success_messages["s" + i]);
						});

						// completed gate with at least one
						// successful segment, so send success
						// messages into main sequence
						mainDone.apply(ø,msgs);
					}
					else {
						fns
						.forEach(function __foreach__(fn,i){
							msgs.push(error_messages["s" + i]);
						});
						// completed gate without success, so
						// send errors into main sequence
						mainDone.fail.apply(ø,msgs);
					}
				}
			}

			var success = false, completed = 0,
				success_messages = {}, error_messages = {},
				sq = ASQ.apply(ø,ARRAY_SLICE.call(arguments,1))
			;

			fns = fns.map(function __map__(fn,idx){
				return function __segment__(done) {
					var args = ARRAY_SLICE.call(arguments);
					args[0] = function __done__() {
						success = true;
						completed++;
						success_messages["s" + idx] =
							arguments.length > 1 ?
							ASQ.messages.apply(ø,arguments) :
							arguments[0]
						;
						checkGate();
					};
					args[0].fail = function __fail__() {
						completed++;
						error_messages["s" + idx] =
							arguments.length > 1 ?
							ASQ.messages.apply(ø,arguments) :
							arguments[0]
						;
						checkGate();
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
