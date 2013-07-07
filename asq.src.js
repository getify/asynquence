/*! asynquence
    v0.0.1 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function(global){

	var old_ASQ = global.ASQ;

	// test for array
	function is_array(arr) { return Object.prototype.toString.call(arr) == "[object Array]"; }

	// flatten array
	function flatten_array(arr) {
		for (var i=0; i<arr.length; ) {
			if (is_array(arr[i])) {
				// prepend `splice()` arguments to `tmp` array, to enable `apply()` call
				arr.splice.apply(arr,[i,1].concat(arr[i]));
				continue;
			}
			i++;
		}

		return arr;
	}

	function createSandbox() {

		function createSequence() {

			function scheduleNextTick() {

			}

			function createSequenceTrigger() {
				function done() {

				}

				var pool_idx = pool.length;

				done.fail = function(){

				};
				done.abort = function(){

				};

				return done;
			}

			function createGate(segments) {

				function checkGate() {
					scheduleNextTick();
				}

				function createGateTrigger() {

					function done() {

					}

					var pool_idx = pool.length;

					done.fail = function(){

					};
					done.abort = function(){

					};

					return done;
				}

				var i, args,
					error = false,
					aborted = false,
					err_msg,
					pool = [],
					gate_messages = []
				;

				for (i=0; i<segments.length; i++) {
					if (error) break;

					args = sequence_messages.slice().unshift(createGateTrigger());
					try {
						segments[i].apply(segments[i],args);
					}
					catch (err) {
						err_msg = err;
						break;
					}
				}

				if (err_msg) {
					sequenceError(err_msg);
				}
			}

			function sequenceError() {
				var args = Array.prototype.slice.call(arguments);

				error = true;

				sequence_errors.push.apply(sequence_errors,args);

				scheduleNextTick();
			}

			function then() {
				if (error || aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function or() {
				if (aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function gate() {
				if (error || aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function pipe() {
				if (error || aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function seq() {
				if (error || aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function val() {
				if (error || aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function abort() {
				if (error) return sequenceAPI;
				
				return sequenceAPI;
			}


			var error = false,
				aborted = false,

				then_queue = [],
				or_queue = [],

				sequence_messages = [],
				sequence_errors = [],

				sequenceAPI = {
					then: then,
					or: or,
					gate: gate,
					pipe: pipe,
					seq: seq,
					val: val,
					abort: abort
				}
			;

			return sequenceAPI;
		}

		return createSequence;
	}

	global.ASQ = createSandbox();

	global.ASQ.noConflict = function() {
		var current_ASQ = global.ASQ;
		global.ASQ = old_ASQ;
		return current_ASQ;
	};

})(this);
