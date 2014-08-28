// "wrap"
ASQ.wrap = function __wrap__(fn,opts) {

	function checkThis(t,o) {
		return (!t ||
			(typeof window != "undefined" && t === window) ||
			(typeof global != "undefined" && t === global)
		) ? o : t;
	}

	var errfcb, params_first, act, this_obj;

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
	this_obj = (opts["this"] && typeof opts["this"] == "object") ? opts["this"] : ø;
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

	if (opts.gen) {
		return function __wrapped_gen__() {
			return ASQ.apply(ø,arguments).runner(fn);
		};
	}
	if (errfcb) {
		return function __wrapped_errfcb__() {
			var args = ARRAY_SLICE.call(arguments),
				_this = checkThis(this,this_obj)
			;

			return ASQ(function __asq__(done){
				args[act](done.errfcb);
				fn.apply(_this,args);
			});
		};
	}
	if (opts.splitcb) {
		return function __wrapped_splitcb__() {
			var args = ARRAY_SLICE.call(arguments),
				_this = checkThis(this,this_obj)
			;

			return ASQ(function __asq__(done){
				args[act](done,done.fail);
				fn.apply(_this,args);
			});
		};
	}
	if (opts.simplecb) {
		return function __wrapped_simplecb__() {
			var args = ARRAY_SLICE.call(arguments),
				_this = checkThis(this,this_obj)
			;

			return ASQ(function __asq__(done){
				args[act](done);
				fn.apply(_this,args);
			});
		};
	}
};
