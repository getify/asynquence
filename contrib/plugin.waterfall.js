// "waterfall"
ASQ.extend("waterfall",function __extend__(api,internals){
	return function __waterfall__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var msgs = ASQ.messages();

		ARRAY_SLICE.call(arguments)
		.forEach(function __forEach__(fn){
			api
			.then(fn)
			.val(function __val__(){
				var args = ASQ.messages.apply(ø,arguments);
				msgs.push(args.length > 1 ? args : args[0]);
				return msgs;
			});
		});

		return api;
	};
});
