// "map"
ASQ.extend("map",function __extend__(api,internals){
	return function __map__(arr,each) {
		if (internals("seq_error") || internals("seq_aborted")) {
			return api;
		}

		api
		.gate.apply(ø,arr.map(function __map__(item){
			return function __segment__(){
				each.apply(ø,[item].concat(ARRAY_SLICE.call(arguments)));
			};
		}))
		.val(function(){
			// collect all gate segment output into one value-message
			// Note: return a normal array here, not a message wrapper!
			return ARRAY_SLICE.call(arguments);
		});

		return api;
	};
});
