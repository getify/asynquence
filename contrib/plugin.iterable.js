// "ASQ.iterable()"
(function IIFE(){
	var template;

	ASQ.iterable = function $$iterable() {
		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function notifyErrors() {
			var fn;

			seq_tick = null;

			if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length > 0) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (checkBranding(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
		}

		function val() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			val_queue.push.apply(val_queue,arguments);

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			if (!seq_tick) {
				seq_tick = schedule(notifyErrors);
			}

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(fn){
				val(fn).or(fn.fail);
			});

			return sequence_api;
		}

		function next() {
			if (seq_error || seq_aborted || val_queue.length === 0) {
				if (val_queue.length > 0) {
					$throw$("Sequence cannot be iterated");
				}
				return { done: true };
			}

			try {
				return { value: val_queue.shift().apply(ø,arguments) };
			}
			catch (err) {
				if (ASQ.isMessageWrapper(err)) {
					$throw$.apply(ø,err);
				}
				else {
					$throw$(err);
				}

				return {};
			}
		}

		function $throw$() {
			if (seq_error || seq_aborted) {
				return sequence_api;
			}

			sequence_errors.push.apply(sequence_errors,arguments);
			seq_error = true;
			if (!seq_tick) {
				seq_tick = schedule(notifyErrors);
			}

			return sequence_api;
		}

		function $return$(val) {
			if (seq_error || seq_aborted) {
				val = void 0;
			}

			abort();

			return { done: true, value: val };
		}

		function abort() {
			if (seq_error || seq_aborted) {
				return;
			}

			seq_aborted = true;

			clearTimeout(seq_tick);
			seq_tick = null;
			val_queue.length = or_queue.length = sequence_errors.length = 0;
		}

		function duplicate() {
			var isq;

			template = {
				val_queue: val_queue.slice(),
				or_queue: or_queue.slice()
			};
			isq = ASQ.iterable();
			template = null;

			return isq;
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function $$ignored(){});
			return sequence_api;
		}

		// ***********************************************
		// Object branding utilities
		// ***********************************************
		function brandIt(obj) {
			Object.defineProperty(obj,brand,{
				enumerable: false,
				value: true
			});

			return obj;
		}

		var sequence_api,

			seq_error = false,
			error_reported = false,
			seq_aborted = false,

			seq_tick,

			val_queue = [],
			or_queue = [],

			sequence_errors = []
		;

		// ***********************************************
		// Setup the ASQ.iterable() public API
		// ***********************************************
		sequence_api = brandIt({
			val: val,
			then: val,
			or: or,
			pipe: pipe,
			next: next,
			"throw": $throw$,
			"return": $return$,
			abort: abort,
			duplicate: duplicate,
			defer: defer
		});

		// useful for ES6 `for..of` loops,
		// add `@@iterator` to simply hand back
		// our iterable sequence itself!
		sequence_api[(typeof Symbol == "function" && Symbol.iterator) || "@@iterator"] = function $$iter() {
			return sequence_api;
		};

		// templating the iterable-sequence setup?
		if (template) {
			val_queue = template.val_queue.slice(0);
			or_queue = template.or_queue.slice(0);
		}

		// treat ASQ.iterable() constructor parameters as having been
		// passed to `val()`
		sequence_api.val.apply(ø,arguments);

		return sequence_api;
	};

})();
