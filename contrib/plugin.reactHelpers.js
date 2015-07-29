// "react" helpers
(function IIFE(){

	function tapSequences() {
		function tapSequence(seq) {
			// temporary `trigger` which, if called before being replaced
			// below, creates replacement proxy sequence with the
			// event message(s) re-fired
			function trigger() {
				var args = ARRAY_SLICE.call(arguments);
				def.seq = ASQ.react(function $$react(next){
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
				def.seq = ASQ.react(function $$react(next){
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

	function createReactOperator(buffer) {
		return function $$react$operator(){
			function reactor(next,registerTeardown){
				function processSequence(def) {
					// sequence-stream event listener
					function trigger() {
						var args = ASQ.messages.apply(ø,arguments);
						// still observing sequence-streams?
						if (seqs && seqs.length > 0) {
							// store event message(s), if any
							seq_events[seq_id] = [].concat(
								buffer ? seq_events[seq_id] : [],
								args.length > 0 ? [args] : undefined
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

								// discard stored event message(s)
								seq_events.forEach(function $$each(eventList){
									eventList.shift();
								});
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

			return ASQ.react(reactor);
		};
	}

	ASQ.react.all = ASQ.react.zip = createReactOperator(/*buffer=*/true);

	ASQ.react.latest = ASQ.react.combine = createReactOperator(/*buffer=false*/);

	ASQ.react.any = ASQ.react.merge = function $$react$any(){
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

		return ASQ.react(reactor);
	};

	ASQ.react.distinct = function $$react$distinct(seq){
		function reactor(next,registerTeardown){
			function trigger(){
				function isDuplicate(msgs){
					return (
						msgs.length == messages.length &&
						msgs.every(function $$every(val,idx){
							return val === messages[idx];
						})
					);
				}

				var messages = ASQ.messages.apply(ø,arguments);

				// still observing?
				if (prev_messages) {
					// any messages to check against?
					if (messages.length > 0) {
						// messages already sent before?
						if (prev_messages.some(isDuplicate)) {
							// bail on duplicate messages
							return messages;
						}

						// save messages for future distinct checking
						prev_messages.push(messages);
					}

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
				def = prev_messages = null;
			});
		}

		var prev_messages = [],
			// observe sequence-stream
			def = tapSequences(seq)[0]
		;

		if (!def) return;

		return ASQ.react(reactor);
	};

	ASQ.react.fromObservable = function $$react$from$observable(obsv){
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

		return ASQ.react(reactor);
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

})();
