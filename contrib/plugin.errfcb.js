// "errfcb"
ASQ.extend("errfcb",function __extend__(api,internals){
	return function __errfcb__() {
		// create a fake "iterable-sequence" only to be used
		// by the main sequence's `seq(..)`
		var isq = {
			then: function __then__(cb){ isq.then_cb = cb; return isq; },
			or: function __or__(cb){ isq.or_cb = cb; return isq; },

			// note: these are used only to trick `seq(..)`s
			// duck-typing checks for an "iterable-sequence"
			__ASQ__: true,
			next: true
		};

		// immediately register our fake "iterable sequence"
		// on the main sequence
		api.seq(isq);

		// provide the "error-first" callback
		return function __errorfirst_callback__(err) {
			if (err) {
				isq.or_cb(err);
			}
			else {
				isq.then_cb.apply(ø,ARRAY_SLICE.call(arguments,1));
			}
		};
	};
});
