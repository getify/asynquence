// "after"
ASQ.extend("after",function $$extend(api,internals){
	return function $$after(num) {
		var orig_args = arguments.length > 1 ?
			ARRAY_SLICE.call(arguments,1) :
			void 0
		;
		num = +num || 0;

		api.then(function $$then(done){
			var args = orig_args || ARRAY_SLICE.call(arguments,1);

			setTimeout(function $$set$timeout(){
				done.apply(ø,args);
			},num);
		});

		return api;
	};
});

ASQ.after = function $$after() {
	return ASQ().after.apply(ø,arguments);
};
