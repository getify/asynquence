// "try"
ASQ.extend("try",function $$extend(api,internals){
	return function $$try() {
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
					fn.apply(ø,arguments);
				})
				.val(function $$val(){
					mainDone.apply(ø,arguments);
				})
				.or(function $$inner$or(){
					var msgs = ASQ.messages.apply(ø,arguments);
					// failed, so map error(s) as `catch`
					mainDone({
						"catch": msgs.length > 1 ? msgs : msgs[0]
					});
				});
			};
		});

		api.then.apply(ø,fns);

		return api;
	};
});
