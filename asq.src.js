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

	function create_sandbox() {

		function create_trigger() {

		}

		function create_gate() {

		}

		function then() {
			return instanceAPI;
		}

		function or() {
			return instanceAPI;
		}

		function gate() {
			return instanceAPI;
		}

		function pipe() {
			return instanceAPI;
		}

		function seq() {
			return instanceAPI;
		}

		function val() {
			return instanceAPI;
		}

		function abort() {
			return instanceAPI;
		}


		var then_queue = [],
			or_queue = [],

			instanceAPI = {
				then: then,
				or: or,
				gate: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				abort: abort
			}
		;

		return instanceAPI;
	}

	global.ASQ = create_sandbox();

})(this);
