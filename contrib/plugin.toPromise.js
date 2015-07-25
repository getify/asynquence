// "toPromise"
ASQ.extend("toPromise",function $$extend(api,internals){
	return function $$to$promise() {
		return new Promise(function $$executor(resolve,reject){
			api
			.val(function $$val(){
				var args = ARRAY_SLICE.call(arguments);
				resolve.call(ø,args.length > 1 ? args : args[0]);
				return ASQ.messages.apply(ø,args);
			})
			.or(function $$or(){
				var args = ARRAY_SLICE.call(arguments);
				reject.call(ø,args.length > 1 ? args : args[0]);
			});
		});
	};
});
