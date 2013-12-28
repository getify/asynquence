/*! asynquence
    v0.2.0-a (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(dependency,definition){
	if (typeof module !== "undefined" && module.exports) { module.exports = definition(require(dependency)); }
	else if (typeof define === "function" && define.amd) { define([dependency],definition); }
	else { definition(dependency); }
})(this.ASQ || "./asq.src.js",function DEF(ASQ){
	"use strict";

	var ARRAY_SLICE = Array.prototype.slice,
		ø = Object.create(null)
	;

// "all"
ASQ.extend("all",function __extend__(api){
	return api.gate;
});
// "any"
ASQ.extend("any",function __extend__(api,internals){
	return function __any__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments);

		api.then(function __then__(mainDone){
			function checkGate() {
				var msgs;

				if (completed === fns.length) {
					msgs = [];

					if (success) {
						fns
						.forEach(function __foreach__(fn,i){
							msgs.push(success_messages["s" + i]);
						});

						// completed gate with at least one
						// successful segment, so send success
						// messages into main sequence
						mainDone.apply(ø,msgs);
					}
					else {
						fns
						.forEach(function __foreach__(fn,i){
							msgs.push(error_messages["s" + i]);
						});
						// completed gate without success, so
						// send errors into main sequence
						mainDone.fail.apply(ø,msgs);
					}
				}
			}

			var success = false, completed = 0,
				success_messages = {}, error_messages = {},
				sq = ASQ.apply(ø,ARRAY_SLICE.call(arguments,1))
			;

			fns = fns.map(function __map__(fn,idx){
				return function __segment__(done) {
					var args = ARRAY_SLICE.call(arguments);
					args[0] = function __done__() {
						success = true;
						completed++;
						success_messages["s" + idx] =
							arguments.length > 1 ?
							ASQ.messages.apply(ø,arguments) :
							arguments[0]
						;
						checkGate();
					};
					args[0].fail = function __fail__() {
						completed++;
						error_messages["s" + idx] =
							arguments.length > 1 ?
							ASQ.messages.apply(ø,arguments) :
							arguments[0]
						;
						checkGate();
					};
					args[0].abort = function __abort__() {
						if (!success) {
							done.abort();
							mainDone.abort();
						}
					};

					fn.apply(ø,args);
				};
			});

			sq.gate.apply(ø,fns);
		});

		return api;
	};
});
// "first"
ASQ.extend("first",function __extend__(api,internals){
	return function __first__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments);

		api.then(function __then__(mainDone){
			var completed = 0, error_messages = {}, success = false,
				sq = ASQ.apply(ø,ARRAY_SLICE.call(arguments,1))
			;

			fns = fns.map(function __map__(fn,idx){
				return function __segment__(done) {
					var args = ARRAY_SLICE.call(arguments);
					args[0] = function __done__() {
						if (!success) {
							success = true;
							completed++;

							// first successful segment triggers
							// main sequence to proceed as success
							mainDone(
								arguments.length > 1 ?
								ASQ.messages.apply(ø,arguments) :
								arguments[0]
							);

							// no longer need the inner gate
							sq.abort();
						}
					};
					args[0].fail = function __fail__() {
						var msgs = [];

						completed++;
						error_messages["s" + idx] =
							arguments.length > 1 ?
							ASQ.messages.apply(ø,arguments) :
							arguments[0]
						;

						// all segments complete without success?
						if (!success && completed === fns.length) {
							fns
							.forEach(function __foreach__(fn,i){
								msgs.push(error_messages["s" + i]);
							});

							// send errors into main sequence
							mainDone.fail.apply(ø,msgs);
						}
					};
					args[0].abort = function __abort__() {
						if (!success) {
							done.abort();
							mainDone.abort();
						}
					};

					fn.apply(ø,args);
				};
			});

			sq.gate.apply(ø,fns);
		});

		return api;
	};
});
// "last"
ASQ.extend("last",function __extend__(api,internals){
	return function __last__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments);

		api.then(function __then__(mainDone){
			function checkGate() {
				var msgs;

				if (completed === fns.length) {
					msgs = [];

					if (success) {
						// completed gate with at least one
						// successful segment, so send success
						// message(s) (only from latest successful
						// segment) into main sequence
						mainDone(success_messages);
					}
					else {
						fns
						.forEach(function __foreach__(fn,i){
							msgs.push(error_messages["s" + i]);
						});
						// completed gate without success, so
						// send errors into main sequence
						mainDone.fail.apply(ø,msgs);
					}
				}
			}

			var success = false, completed = 0,
				success_messages = {}, error_messages = {},
				sq = ASQ.apply(ø,ARRAY_SLICE.call(arguments,1))
			;

			fns = fns.map(function __map__(fn,idx){
				return function __segment__(done) {
					var args = ARRAY_SLICE.call(arguments);
					args[0] = function __done__() {
						success = true;
						completed++;
						success_messages =
							arguments.length > 1 ?
							ASQ.messages.apply(ø,arguments) :
							arguments[0]
						;
						checkGate();
					};
					args[0].fail = function __fail__() {
						completed++;
						error_messages["s" + idx] =
							arguments.length > 1 ?
							ASQ.messages.apply(ø,arguments) :
							arguments[0]
						;
						checkGate();
					};
					args[0].abort = function __abort__() {
						if (!success) {
							done.abort();
							mainDone.abort();
						}
					};

					fn.apply(ø,args);
				};
			});

			sq.gate.apply(ø,fns);
		});

		return api;
	};
});
// "none"
ASQ.extend("none",function __extend__(api,internals){
	return function __none__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments);

		api.then(function __then__(mainDone){
			function checkGate() {
				var msgs;

				if (completed === fns.length) {
					msgs = [];

					if (success) {
						fns
						.forEach(function __foreach__(fn,i){
							msgs.push(success_messages["s" + i]);
						});

						// completed gate with at least one
						// successful segment, so send success
						// messages into main sequence as failures
						mainDone.fail.apply(ø,msgs);
					}
					else {
						fns
						.forEach(function __foreach__(fn,i){
							msgs.push(error_messages["s" + i]);
						});
						// completed gate without success, so
						// send errors into main sequence as
						// success
						mainDone.apply(ø,msgs);
					}
				}
			}

			var success = false, completed = 0,
				success_messages = {}, error_messages = {},
				sq = ASQ.apply(ø,ARRAY_SLICE.call(arguments,1))
			;

			fns = fns.map(function __map__(fn,idx){
				return function __segment__(done) {
					var args = ARRAY_SLICE.call(arguments);
					args[0] = function __done__() {
						success = true;
						completed++;
						success_messages["s" + idx] =
							arguments.length > 1 ?
							ASQ.messages.apply(ø,arguments) :
							arguments[0]
						;
						checkGate();
					};
					args[0].fail = function __fail__() {
						completed++;
						error_messages["s" + idx] =
							arguments.length > 1 ?
							ASQ.messages.apply(ø,arguments) :
							arguments[0]
						;
						checkGate();
					};
					args[0].abort = function __abort__() {
						if (!success) {
							done.abort();
							mainDone.abort();
						}
					};

					fn.apply(ø,args);
				};
			});

			sq.gate.apply(ø,fns);
		});

		return api;
	};
});
// "try"
ASQ.extend("try",function __extend__(api,internals){
	return function __try__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments)
		.map(function __map__(fn){
			return function __then__(mainDone) {
				var main_args = ARRAY_SLICE.call(arguments),
					sq = ASQ.apply(ø,main_args.slice(1))
				;

				sq
				.then(function __inner_then__(){
					fn.apply(ø,arguments);
				})
				.val(function __val__(){
					mainDone.apply(ø,arguments);
				})
				.or(function __inner_or__(){
					var msgs = ASQ.messages.apply(ø,arguments);
					// failed, so map error(s) as `catch`
					mainDone({
						"catch": msgs.length > 1 ? msgs : msgs[0]
					});
				});
			};
		});

		api.then.apply(ø,fns);

		return api;
	};
});
// "until"
ASQ.extend("until",function __extend__(api,internals){
	return function __until__() {
		if (internals("seq_error") || internals("seq_aborted") ||
			arguments.length === 0
		) {
			return api;
		}

		var fns = ARRAY_SLICE.call(arguments)
		.map(function __map__(fn){
			return function __then__(mainDone) {
				var main_args = ARRAY_SLICE.call(arguments),
					sq = ASQ.apply(ø,main_args.slice(1))
				;

				sq
				.then(function __inner_then__(){
					var args = ARRAY_SLICE.call(arguments);
					args[0].break = function __break__(){
						mainDone.fail.apply(ø,arguments);
						sq.abort();
					};

					fn.apply(ø,args);
				})
				.val(function __val__(){
					mainDone.apply(ø,arguments);
				})
				.or(function __inner_or__(){
					// failed, retry
					__then__.apply(ø,main_args);
				});
			};
		});

		api.then.apply(ø,fns);

		return api;
	};
});


	// this is an empty module with no API
	return {};
});
