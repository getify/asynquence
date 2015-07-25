// "map"
ASQ.extend("map",function $$extend(api,internals){
	return function $$map(pArr,pEach) {
		if (internals("seq_error") || internals("seq_aborted")) {
			return api;
		}

		api.seq(function $$seq(){
			var tmp, args = ARRAY_SLICE.call(arguments),
				arr = pArr, each = pEach;

			// if missing `map(..)` args, use value-messages (if any)
			if (!each) each = args.shift();
			if (!arr) arr = args.shift();

			// if arg types in reverse order (each,arr), swap
			if (typeof arr === "function" && Array.isArray(each)) {
				tmp = arr;
				arr = each;
				each = tmp;
			}

			return ASQ.apply(ø,args)
			.gate.apply(ø,arr.map(function $$map(item){
				return function $$segment(){
					each.apply(ø,[item].concat(ARRAY_SLICE.call(arguments)));
				};
			}));
		})
		.val(function $$val(){
			// collect all gate segment output into one value-message
			// Note: return a normal array here, not a message wrapper!
			return ARRAY_SLICE.call(arguments);
		});

		return api;
	};
});
