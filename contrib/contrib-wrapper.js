/*! asynquence-contrib
    v0.9.0-a (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(dependency,definition){
	if (typeof module !== "undefined" && module.exports) {
		// make dependency injection wrapper first
		module.exports = function $InjectDependency$(dep) {
			// only try to `require(..)` if dependency is a string module path
			if (typeof dep == "string") {
				try { dep = require(dep); }
				catch (err) {
					// dependency not yet fulfilled, so just return
					// dependency injection wrapper again
					return $InjectDependency$;
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
		fns = fns.map(function __map__(fn,idx){
			var def;
			// tap any directly-provided sequences immediately
			if (ASQ.isSequence(fn)) {
				def = { fn: fn };
				tapSequence(def);
				return function __fn__(trigger) {
					def.fn
					.val(function __val__(){
						success(trigger,idx,ARRAY_SLICE.call(arguments));
					})
					.or(function __or__(){
						failure(trigger,idx,ARRAY_SLICE.call(arguments));
					});
				};
			}
			else {
				return function __fn__(trigger) {
					var args = ARRAY_SLICE.call(arguments);
					args[0] = function __trigger__() {
						success(trigger,idx,ARRAY_SLICE.call(arguments));
					};
					args[0].fail = function __fail__() {
						failure(trigger,idx,ARRAY_SLICE.call(arguments));
					};
					args[0].abort = function __abort__() {
						reset();
					};
					args[0].errfcb = function __errfcb__(err) {
						if (err) {
							failure(trigger,idx,[err]);
						}
						else {
							success(trigger,idx,ARRAY_SLICE.call(arguments,1));
						}
					};

					fn.apply(ø,args);
				};
			}
		});

		api.then(function __then__(){
			var args = ARRAY_SLICE.call(arguments);

			fns.forEach(function __forEach__(fn){
				fn.apply(ø,args);
			});
		});
	}

/*PLUGINS*/

	// just return `ASQ` itself for convenience sake
	return ASQ;
});
