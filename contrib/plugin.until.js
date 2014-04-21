// "until"
ASQ.extend("until",function __extend__(api,internals){
	return function __until__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments)
		.map(function __map__(fn){
			return function __then__(mainDone) {
				var main_args = ARRAY_SLICE.call(arguments),
					sq = ASQ.apply(ø,main_args.slice(1))
				;

				sq
				.then(function __inner_then__(){
					var args = ARRAY_SLICE.call(arguments);
					args[0]["break"] = function __break__(){
						mainDone.fail.apply(ø,arguments);
						sq.abort();
					};

					fn.apply(ø,args);
				})
				.val(function __val__(){
					mainDone.apply(ø,arguments);
				})
				.or(function __inner_or__(){
					// failed, retry
					__then__.apply(ø,main_args);
				});
			};
		});

		api.then.apply(ø,fns);

		return api;
	};
});
