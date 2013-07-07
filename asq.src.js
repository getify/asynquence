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
		var instanceAPI;

		instanceAPI = {};

		return instanceAPI;
	}

	global.ASQ = create_sandbox();

})(this);
