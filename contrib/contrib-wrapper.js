/*! asynquence-contrib
    v0.2.2-b (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(dependency,definition){
	if (typeof module !== "undefined" && module.exports) {
		// make dependency injection wrapper first
		module.exports = function $InjectDependency$(dep) {
			try { dep = require(dep); }
			catch (err) {
				// dependency not yet fulfilled, so just return
				// dependency injection wrapper again
				return $InjectDependency$;
			}
			return definition(dep);
		};

		// if possible, immediately try to resolve wrapper
		// (with peer dependency)
		module.exports = module.exports( require("path").join("..",dependency) );
	}
	else if (typeof define === "function" && define.amd) { define([dependency],definition); }
	else { definition(dependency); }
})(this.ASQ || "asynquence",function DEF(ASQ){
	"use strict";

	var ARRAY_SLICE = Array.prototype.slice,
		ø = Object.create(null),
		brand = "__ASQ__"
	;

/*PLUGINS*/

	// just return ASQ itself for convenience sake
	return ASQ;
});
