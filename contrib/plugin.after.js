// "after"
ASQ.extend("after",function __extend__(api,internals){
	return function __after__(num) {
		var orig_args = arguments.length > 1 ?
			ARRAY_SLICE.call(arguments,1) :
			void 0
		;
		num = +num || 0;

		api.then(function __then__(done){
			var args = orig_args || ARRAY_SLICE.call(arguments,1);

			setTimeout(function __setTimeout__(){
				done.apply(ø,args);
			},num);
		});

		return api;
	};
});

ASQ.after = function ASQ$after() {
	return ASQ().after.apply(ø,arguments);
};
