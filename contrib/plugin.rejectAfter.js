// "failAfter"
ASQ.failAfter = function __rejectAfter__(num) {
	var args = ARRAY_SLICE.call(arguments,1);
	num = +num || 0;

	return ASQ(function(done){
		setTimeout(function(){
			done.fail.apply(ø,args);
		},num);
	});
};

