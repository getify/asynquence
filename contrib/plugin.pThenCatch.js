// "pThen"
ASQ.extend("pThen",function $$extend(api,internals){
	return function $$pthen(success,failure) {
		if (internals("seq_aborted")) {
			return api;
		}

		var ignore_success_handler = false, ignore_failure_handler = false;

		if (typeof success === "function") {
			api.then(function $$then(done){
				if (!ignore_success_handler) {
					var ret, msgs = ASQ.messages.apply(ø,arguments);
					msgs.shift();

					if (msgs.length === 1) {
						msgs = msgs[0];
					}

					ignore_failure_handler = true;

					try {
						ret = success(msgs);
					}
					catch (err) {
						if (!ASQ.isMessageWrapper(err)) {
							err = [err];
						}
						done.fail.apply(ø,err);
						return;
					}

					// returned a sequence?
					if (ASQ.isSequence(ret)) {
						ret.pipe(done);
					}
					// returned a message wrapper?
					else if (ASQ.isMessageWrapper(ret)) {
						done.apply(ø,ret);
					}
					// returned a promise/thenable?
					// NOTE: `then` duck-typing of promises is stupid.
					else if (
						(typeof ret === "object" || typeof ret === "function") &&
						typeof ret.then === "function"
					) {
						ret.then(done,done.fail);
					}
					// just a normal value to pass along
					else {
						done(ret);
					}
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			});
		}
		if (typeof failure === "function") {
			api.or(function $$or(){
				if (!ignore_failure_handler) {
					var ret, msgs = ASQ.messages.apply(ø,arguments), smgs,
						or_queue = ARRAY_SLICE.call(internals("or_queue"))
					;

					if (msgs.length === 1) {
						msgs = msgs[0];
					}

					ignore_success_handler = true;

					// NOTE: if this call throws, that'll automatically
					// be handled by core as we'd want it to be
					ret = failure(msgs);

					// if we get this far:
					// first, inject return value (if any) as
					// next step's sequence messages
					smgs = internals("sequence_messages");
					smgs.length = 0;
					if (typeof ret !== "undefined") {
						if (!ASQ.isMessageWrapper(ret)) {
							ret = [ret];
						}
						smgs.push.apply(smgs,ret);
					}

					// reset internal error state, because we've exclusively
					// handled any errors up to this point of the sequence
					internals("sequence_errors").length = 0;
					internals("seq_error",false);
					internals("then_ready",true);

					// temporarily empty the or-queue
					internals("or_queue").length = 0;

					// make sure to schedule success-procession on the chain
					api.val(function $$val(){
						// pass thru messages
						return ASQ.messages.apply(ø,arguments);
					});

					// at next cycle, reinstate the or-queue (if any)
					if (or_queue.length > 0) {
						schedule(function $$schedule(){
							api.or.apply(ø,or_queue);
						});
					}
				}
			});
		}
		return api;
	};
});

// "pCatch"
ASQ.extend("pCatch",function $$extend(api,internals){
	return function $$pcatch(failure) {
		if (internals("seq_aborted")) {
			return api;
		}

		api.pThen(void 0,failure);

		return api;
	};
});
