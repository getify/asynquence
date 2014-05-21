// "toPromise"
ASQ.extend("toPromise",function __extend__(api,internals){
	return function __toPromise__() {
		return new Promise(function(resolve,reject){
			api
			.val(function(){
				var args = ARRAY_SLICE.call(arguments);
				resolve.call(ø,args.length > 1 ? args : args[0]);
				return ASQ.messages.apply(ø,args);
			})
			.or(function(){
				var args = ARRAY_SLICE.call(arguments);
				reject.call(ø,args.length > 1 ? args : args[0]);
			});
		});
	};
});
