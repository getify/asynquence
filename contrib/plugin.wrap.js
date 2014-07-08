// "wrap"
ASQ.wrap = function __wrap__(fn,opts) {
	var errfcb, params_first, act;

	opts = (opts && typeof opts == "object") ? opts : {};

	if (
		(opts.errfcb && opts.splitcb) ||
		(opts.errfcb && opts.simplecb) ||
		(opts.splitcb && opts.simplecb) ||
		("errfcb" in opts && !opts.errfcb && !opts.splitcb && !opts.simplecb) ||
		(opts.params_first && opts.params_last)
	) {
		throw Error("Invalid options");
	}

	// initialize default flags
	errfcb = opts.errfcb || !(opts.splitcb || opts.simplecb);
	params_first = !!opts.params_first ||
		(!opts.params_last && !("params_first" in opts || opts.params_first)) ||
		("params_last" in opts && !opts.params_first && !opts.params_last)
	;

	if (params_first) {
		act = "push";
	}
	else {
		act = "unshift";
	}

	if (errfcb) {
		return function __wrapped_errfcb__() {
			var args = ARRAY_SLICE.call(arguments);

			return ASQ(function __asq__(done){
				args[act](done.errfcb);
				fn.apply(ø,args);
			});
		};
	}
	if (opts.splitcb) {
		return function __wrapped_splitcb__() {
			var args = ARRAY_SLICE.call(arguments);

			return ASQ(function __asq__(done){
				args[act](done,done.fail);
				fn.apply(ø,args);
			});
		};
	}
	if (opts.simplecb) {
		return function __wrapped_simplecb__() {
			var args = ARRAY_SLICE.call(arguments);

			return ASQ(function __asq__(done){
				args[act](done);
				fn.apply(ø,args);
			});
		};
	}
};
