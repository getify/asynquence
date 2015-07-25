// "errfcb"
ASQ.extend("errfcb",function $$extend(api,internals){
	return function $$errfcb() {
		// create a fake sequence to extract the callbacks
		var sq = {
			val: function $$then(cb){ sq.val_cb = cb; return sq; },
			or: function $$or(cb){ sq.or_cb = cb; return sq; }
		};

		// trick `seq(..)`s checks for a sequence
		sq[brand] = true;

		// immediately register our fake sequence on the
		// main sequence
		api.seq(sq);

		// provide the "error-first" callback
		return function $$errorfirst$callback(err) {
			if (err) {
				sq.or_cb(err);
			}
			else {
				sq.val_cb.apply(ø,ARRAY_SLICE.call(arguments,1));
			}
		};
	};
});
