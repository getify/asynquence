// "failAfter"
ASQ.extend("failAfter",function __extend__(api,internals){
	return function __failAfter__(num) {
		var args = arguments.length > 1 ?
			ARRAY_SLICE.call(arguments,1) :
			void 0
		;
		num = +num || 0;

		api.then(function(done){
			setTimeout(function(){
				done.fail.apply(ø,args);
			},num);
		});

		return api;
	};
});

ASQ.failAfter = function ASQ$failAfter() {
	return ASQ().failAfter.apply(ø,arguments);
};
