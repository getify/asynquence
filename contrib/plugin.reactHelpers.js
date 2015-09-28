// "react" helpers
(function IIFE(){

	var Ar = ASQ.react;

	Ar.of = function $$react$of() {
		function reactor(next) {
			if (!started) {
				started = true;
				if (args.length > 0) {
					args.shift().val(function val(){
						next.apply(ø,arguments);
						if (args.length > 0) {
							args.shift().val(val);
						}
					});
				}
			}
		}

		var started, args = ARRAY_SLICE.call(arguments)
			.map(function wrapper(arg){
				if (!ASQ.isSequence(arg)) arg = ASQ(arg);
				return arg;
			});

		return Ar(reactor);
	};

	Ar.all = Ar.zip = makeReactOperator(/*buffer=*/true);
	Ar.allLatest = makeReactOperator(/*buffer=false*/);
	Ar.latest = Ar.combineLatest = makeReactOperator(/*buffer=*/false,/*keep=*/true);

	Ar.any = Ar.merge = function $$react$any(){
		function reactor(next,registerTeardown){
			function processSequence(def){
				function trigger(){
					var args = ASQ.messages.apply(ø,arguments);
					// still observing sequence-streams?
					if (seqs && seqs.length > 0) {
						// fire off reactive sequence instance
						next.apply(ø,args);
					}
					// keep sequence going
					return args;
				}

				// sequence-stream event listener
				def.seq.val(trigger);
			}

			// observe all sequence-streams
			seqs.forEach(processSequence);

			// listen for stop() of reactive sequence
			registerTeardown(function $$teardown(){
				seqs = null;
			});
		}

		// observe all sequence-streams
		var seqs = tapSequences.apply(null,arguments);

		if (seqs.length == 0) return;

		return Ar(reactor);
	};

	Ar.distinct = function $$react$distinct(seq){
		return Ar.filter(seq,makeDistinctFilterer(/*keepAll=*/true));
	};

	Ar.distinctConsecutive = Ar.distinctUntilChanged = function $$react$distinct$consecutive(seq) {
		return Ar.filter(seq,makeDistinctFilterer(/*keepAll=*/false));
	};

	Ar.filter = function $$react$filter(seq,filterer){
		function reactor(next,registerTeardown) {
			function trigger(){
				var messages = ASQ.messages.apply(ø,arguments);

				if (filterer && filterer.apply(ø,messages)) {
					// fire off reactive sequence instance
					next.apply(ø,messages);
				}

				// keep sequence going
				return messages;
			}

			// sequence-stream event listener
			def.seq.val(trigger);

			// listen for stop() of reactive sequence
			registerTeardown(function $$teardown(){
				def = filterer = null;
			});
		}

		// observe sequence-stream
		var def = tapSequences(seq)[0];

		if (!def) return;

		return Ar(reactor);
	};

	Ar.fromObservable = function $$react$from$observable(obsv){
		function reactor(next,registerTeardown){
			// process buffer (if any)
			buffer.forEach(next);
			buffer.length = 0;

			// start non-buffered notifications?
			if (!buffer.complete) {
				notify = next;
			}

			registerTeardown(function $$teardown(){
				obsv.dispose();
			});
		}

		function notify(v) {
			buffer.push(v);
		}

		var buffer = [];

		obsv.subscribe(
			function $$on$next(v){
				notify(v);
			},
			function $$on$error(){},
			function $$on$complete(){
				buffer.complete = true;
				obsv.dispose();
			}
		);

		return Ar(reactor);
	};

	ASQ.extend("toObservable",function $$extend(api,internals){
		return function $$to$observable(){
			function init(observer) {
				function define(pair){
					function listen(){
						var args = ASQ.messages.apply(ø,arguments);
						observer[pair[1]].apply(observer,
							args.length == 1 ? [args[0]] : args
						);
						return args;
					}

					api[pair[0]](listen);
				}

				[["val","onNext"],["or","onError"]]
				.forEach(define);
			}

			return Rx.Observable.create(init);
		};
	});

	function tapSequences() {
		function tapSequence(seq) {
			// temporary `trigger` which, if called before being replaced
			// below, creates replacement proxy sequence with the
			// event message(s) re-fired
			function trigger() {
				var args = ARRAY_SLICE.call(arguments);
				def.seq = Ar(function $$react(next){
					next.apply(ø,args);
				});
			}

			if (ASQ.isSequence(seq)) {
				var def = { seq: seq };

				// listen for events from the sequence-stream
				seq.val(function $$val(){
					trigger.apply(ø,arguments);
					return ASQ.messages.apply(ø,arguments);
				});

				// make a reactive sequence to act as a proxy to the original
				// sequence
				def.seq = Ar(function $$react(next){
					// replace the temporary trigger (created above)
					// with this proxy's trigger
					trigger = next;
				});

				return def;
			}
		}

		return ARRAY_SLICE.call(arguments)
			.map(tapSequence)
			.filter(Boolean);
	}

	function makeReactOperator(buffer,keep) {
		return function $$react$operator(){
			function reactor(next,registerTeardown){
				function processSequence(def) {
					// sequence-stream event listener
					function trigger() {
						var args = ASQ.messages.apply(ø,arguments);
						// still observing sequence-streams?
						if (seqs && seqs.length > 0) {
							// store event message(s), if any
							seq_events[seq_id] =
								(buffer ? seq_events[seq_id] : []).concat(
									args.length > 0 ? (args.length > 1 ? [args] : args[0]) : undefined
								);

							// collect event message(s) across the
							// sequence-stream sources
							var messages = seq_events.reduce(function reducer(msgs,eventList,idx){
									if (eventList.length > 0) msgs.push(eventList[0]);
									return msgs;
								},[]);

							// did all sequence-streams get an event?
							if (messages.length == seq_events.length) {
								if (messages.length == 1) messages = messages[0];

								// fire off reactive sequence instance
								next.apply(ø,messages);

								// discard stored event message(s)?
								if (!keep) {
									seq_events.forEach(function $$each(eventList){
										eventList.shift();
									});
								}
							}
						}
						// keep sequence going
						return args;
					}

					var seq_id = seq_events.length;
					seq_events.push([]);
					def.seq.val(trigger);
				}

				// process all sequence-streams
				seqs.forEach(processSequence);

				// listen for stop() of reactive sequence
				registerTeardown(function $$teardown(){
					seqs = seq_events = null;
				});
			}

			var seq_events = [],
				// observe all sequence-streams
				seqs = tapSequences.apply(null,arguments)
			;

			if (seqs.length == 0) return;

			return Ar(reactor);
		};
	}

	function makeDistinctFilterer(keepAll) {
		function filterer() {
			function isDuplicate(msgSet) {
				return (
					msgSet.length == message_set.length &&
					msgSet.every(function $$every(val,idx){
						return val === message_set[idx];
					})
				);
			}

			var message_set = ASQ.messages.apply(ø,arguments);

			// any messages in message-set to check against?
			if (message_set.length > 0) {
				// duplicate message-set?
				if (msg_sets.some(isDuplicate)) {
					return false;
				}

				// remember all message-sets for future distinct checking?
				if (keepAll) {
					msg_sets.push(message_set);
				}
				// only keep the last message-set for distinct-consecutive
				// checking
				else {
					msg_sets[0] = message_set;
				}
			}

			// allow distinct non-duplicate value through
			return true;
		}

		var msg_sets = [];

		return filterer;
	}

})();
