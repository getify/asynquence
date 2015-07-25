// "until"
ASQ.extend("until",function $$extend(api,internals){
	return function $$until() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments)
		.map(function $$map(fn){
			return function $$then(mainDone) {
				var main_args = ARRAY_SLICE.call(arguments),
					sq = ASQ.apply(ø,main_args.slice(1))
				;

				sq
				.then(function $$inner$then(){
					var args = ARRAY_SLICE.call(arguments);
					args[0]["break"] = function $$break(){
						mainDone.fail.apply(ø,arguments);
						sq.abort();
					};

					fn.apply(ø,args);
				})
				.val(function $$val(){
					mainDone.apply(ø,arguments);
				})
				.or(function $$inner$or(){
					// failed, retry
					$$then.apply(ø,main_args);
				});
			};
		});

		api.then.apply(ø,fns);

		return api;
	};
});
