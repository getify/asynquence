/*! asynquence-contrib
    v0.11.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(dependency,definition){
	if (typeof module !== "undefined" && module.exports) {
		// make dependency injection wrapper first
		module.exports = function $$inject$dependency(dep) {
			// only try to `require(..)` if dependency is a string module path
			if (typeof dep == "string") {
				try { dep = require(dep); }
				catch (err) {
					// dependency not yet fulfilled, so just return
					// dependency injection wrapper again
					return $$inject$dependency;
				}
			}
			return definition(dep);
		};

		// if possible, immediately try to resolve wrapper
		// (with peer dependency)
		if (typeof dependency == "string") {
			module.exports = module.exports( require("path").join("..",dependency) );
		}
	}
	else if (typeof define == "function" && define.amd) { define([dependency],definition); }
	else { definition(dependency); }
})(this.ASQ || "asynquence",function DEF(ASQ){
	"use strict";

	var ARRAY_SLICE = Array.prototype.slice,
		ø = Object.create(null),
		brand = "__ASQ__",
		schedule = ASQ.__schedule,
		tapSequence = ASQ.__tapSequence
	;

	function wrapGate(api,fns,success,failure,reset) {
		fns = fns.map(function $$map(v,idx){
			var def;
			// tap any directly-provided sequences immediately
			if (ASQ.isSequence(v)) {
				def = { seq: v };
				tapSequence(def);
				return function $$fn(next) {
					def.seq.val(function $$val(){
						success(next,idx,ARRAY_SLICE.call(arguments));
					})
					.or(function $$or(){
						failure(next,idx,ARRAY_SLICE.call(arguments));
					});
				};
			}
			else {
				return function $$fn(next) {
					var args = ARRAY_SLICE.call(arguments);
					args[0] = function $$next() {
						success(next,idx,ARRAY_SLICE.call(arguments));
					};
					args[0].fail = function $$fail() {
						failure(next,idx,ARRAY_SLICE.call(arguments));
					};
					args[0].abort = function $$abort() {
						reset();
					};
					args[0].errfcb = function $$errfcb(err) {
						if (err) {
							failure(next,idx,[err]);
						}
						else {
							success(next,idx,ARRAY_SLICE.call(arguments,1));
						}
					};

					v.apply(ø,args);
				};
			}
		});

		api.then(function $$then(){
			var args = ARRAY_SLICE.call(arguments);

			fns.forEach(function $$each(fn){
				fn.apply(ø,args);
			});
		});
	}

/*PLUGINS*/

	// just return `ASQ` itself for convenience sake
	return ASQ;
});
