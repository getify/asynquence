// "failAfter"
ASQ.extend("failAfter",function $$extend(api,internals){
	return function $$failAfter(num) {
		var args = arguments.length > 1 ?
			ARRAY_SLICE.call(arguments,1) :
			void 0
		;
		num = +num || 0;

		api.then(function $$then(done){
			setTimeout(function $$set$timeout(){
				done.fail.apply(ø,args);
			},num);
		});

		return api;
	};
});

ASQ.failAfter = function $$fail$after() {
	return ASQ().failAfter.apply(ø,arguments);
};
