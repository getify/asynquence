// "react" (reactive sequences)
ASQ.react = function __react__(fn) {
	var ARRAY_SLICE = Array.prototype.slice,
		brand = "__ASQ__", ø = Object.create(null),
		template
	;

	function proceed() {
		var sq = template.duplicate();
		sq.unpause.apply(ø,arguments);
		return sq;
	}

	// make sure `fn(..)` is called async
	ASQ(function __asq__(){
		fn(proceed);
	});

	template = ASQ().duplicate();
	return template;
};
