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

			function scheduleSequenceTick() {

			}

			function createStepCompletion() {
				function done() {
					if (seq_error || seq_aborted) return;

					var args = Array.prototype.slice.call(arguments);

					sequence_messages = args.length > 1 ? args : args[0];
					sequence_errors = null;

					scheduleSequenceTick();
				}

				done.fail = function(){
					if (seq_error || seq_aborted) return;

					var args = Array.prototype.slice.call(arguments);

					seq_error = true;
					sequence_messages.length = 0;
					sequence_errors = args.length > 1 ? args : args[0];

					scheduleSequenceTick();
				};

				done.abort = function(){
					if (seq_error || seq_aborted) return;

					seq_aborted = true;
					sequence_messages.length = 0;
					sequence_errors.length = 0;

					scheduleSequenceTick();
				};

				return done;
			}

			function createGate(segments) {

				function scheduleGateTick() {

				}

				function checkGate() {
					if (seq_error || seq_aborted || gate_error || gate_aborted || gate_completed || segment_completion.length === 0) return;

					var i, fulfilled = true;

					for (i=0; i<segment_completion.length; i++) {
						if (segment_completion[i] === null) {
							fulfilled = false;
							break;
						}
					}

					if (fulfilled) {
						gate_completed = true;
						segment_completion.length = 0;
					}
				}

				function createSegmentCompletion() {

					function done() {
						if (seq_error || seq_aborted || gate_error || gate_aborted || gate_completed) return;

						var args = Array.prototype.slice.call(arguments);

						segment_messages["m" + segment_completion_idx] = args.length > 1 ? args : args[0];
						segment_completion[segment_completion_idx] = true;
						segment_error_message = null;

						scheduleGateTick();
					}

					var segment_completion_idx = segment_completion.length;

					done.fail = function(){
						if (seq_error || seq_aborted || gate_error || gate_aborted || gate_completed) return;

						var args = Array.prototype.slice.call(arguments);

						gate_error = true;
						segment_completion.length = 0;
						segment_messages = {};
						segment_error_message = args.length > 1 ? args : args[0];

						scheduleGateTick();
					};

					done.abort = function(){
						if (seq_error || seq_aborted || gate_error || gate_aborted || gate_completed) return;

						gate_aborted = true;
						segment_completion.length = 0;
						segment_messages = {};
						segment_error_message = null;

						scheduleGateTick();
					};

					// placeholder for when a gate-segment completes
					segment_completion[segment_completion_idx] = null;

					return done;
				}

				var gate_error = false,
					gate_aborted = false,
					gate_completed = false,

					i,
					args,
					err_msg,

					segment_completion = [],
					segment_messages = {},
					segment_error_message
				;

				for (i=0; i<segments.length; i++) {
					if (gate_error || gate_aborted) break;

					args = sequence_messages.slice().unshift(createSegmentCompletion());
					try {
						segments[i].apply(segments[i],args);
					}
					catch (err) {
						err_msg = err;
						gate_error = true;
						break;
					}
				}

				if (err_msg) {
					sequenceError(err_msg);
				}
			}

			function sequenceError() {
				if (seq_error || seq_aborted) return sequenceAPI;

				var args = Array.prototype.slice.call(arguments);

				seq_error = true;
				sequence_errors.push.apply(sequence_errors,args);

				scheduleSequenceTick();
			}

			function then() {
				if (seq_error || seq_aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function or() {
				if (seq_aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function gate() {
				if (seq_error || seq_aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function pipe() {
				if (seq_error || seq_aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function seq() {
				if (seq_error || seq_aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function val() {
				if (seq_error || seq_aborted) return sequenceAPI;

				return sequenceAPI;
			}

			function abort() {
				if (seq_error) return sequenceAPI;

				return sequenceAPI;
			}


			var seq_error = false,
				seq_aborted = false,

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
