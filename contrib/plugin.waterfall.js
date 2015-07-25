// "waterfall"
ASQ.extend("waterfall",function $$extend(api,internals){
	return function $$waterfall() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments);

		api.then(function $$then(done){
			var msgs = ASQ.messages(),
				sq = ASQ.apply(ø,ARRAY_SLICE.call(arguments,1))
			;

			fns.forEach(function $$each(fn){
				sq.then(fn)
				.val(function $$val(){
					var args = ASQ.messages.apply(ø,arguments);
					msgs.push(args.length > 1 ? args : args[0]);
					return msgs;
				});
			});

			sq.pipe(done);
		});

		return api;
	};
});
