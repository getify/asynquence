/*! asynquence-go-csp
    v0.0.1-a (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(dependency,definition){
	if (typeof module !== "undefined" && module.exports) {
		// make dependency injection wrapper first
		module.exports = function $InjectDependency$(dep) {
			// only try to `require(..)` if dependency is a string module path
			if (typeof dep == "string") {
				try { dep = require(dep); }
				catch (err) {
					// dependency not yet fulfilled, so just return
					// dependency injection wrapper again
					return $InjectDependency$;
				}
			}
			return definition(dep);
		};

		// if possible, immediately try to resolve wrapper
		// (with peer dependency)
		if (typeof dependency == "string") {
			module.exports = module.exports( require("path").join("..",dependency) );
		}
	}
	else if (typeof define == "function" && define.amd) { define([dependency],definition); }
	else { definition(dependency); }
})(this.ASQ || "asynquence",function DEF(ASQ){

	// filter out already-resolved queue entries
	function filterResolved(queue) {
		return queue.filter(function __filter__(entry){
			return !entry.resolved;
		});
	}

	function closeQueue(queue,finalValue) {
		queue.forEach(function __forEach__(iter){
			if (!iter.resolved) {
				iter.next();
				iter.next(finalValue);
			}
		});
		queue.length = 0;
	}

	function channel(bufSize) {
		var ch = {
			close: function __close__(){
				ch.closed = true;
				closeQueue(ch.put_queue,false);
				closeQueue(ch.take_queue,ASQ.csp.CLOSED);
			},
			closed: false,
			messages: [],
			put_queue: [],
			take_queue: [],
			buffer_size: +bufSize || 0
		};
		return ch;
	}

	function unblock(iter) {
		if (iter && !iter.resolved) {
			iter.next(iter.next().value);
		}
	}

	function put(channel,value) {
		var ret;

		if (channel.closed) {
			return false;
		}

		// remove already-resolved entries
		channel.put_queue = filterResolved(channel.put_queue);
		channel.take_queue = filterResolved(channel.take_queue);

		// immediate put?
		if (channel.messages.length < channel.buffer_size) {
			channel.messages.push(value);
			unblock(channel.take_queue.shift());
			return true;
		}
		// queued put
		else {
			channel.put_queue.push(
				// make a notifiable iterable for 'put' blocking
				ASQ.iterable()
				.then(function __then__(){
					if (!channel.closed) {
						channel.messages.push(value);
						return true;
					}
					else {
						return false;
					}
				})
			);

			// wrap a sequence/promise around the iterable
			ret = ASQ(
				channel.put_queue[channel.put_queue.length - 1]
			);

			// take waiting on this queued put?
			if (channel.take_queue.length > 0) {
				unblock(channel.put_queue.shift());
				unblock(channel.take_queue.shift());
			}

			return ret;
		}
	}

	function putAsync(channel,value,cb) {
		var ret = ASQ(put(channel,value));

		if (cb && typeof cb == "function") {
			ret.val(cb);
		}
		else {
			return ret;
		}
	}

	function take(channel) {
		var ret;

		try {
			ret = takem(channel);
		}
		catch (err) {
			ret = err;
		}

		if (ASQ.isSequence(ret)) {
			ret.pCatch(function __pcatch__(err){
				return err;
			});
		}

		return ret;
	}

	function takeAsync(channel,cb) {
		var ret = ASQ(take(channel));

		if (cb && typeof cb == "function") {
			ret.val(cb);
		}
		else {
			return ret;
		}
	}

	function takem(channel) {
		var msg;

		if (channel.closed) {
			return ASQ.csp.CLOSED;
		}

		// remove already-resolved entries
		channel.put_queue = filterResolved(channel.put_queue);
		channel.take_queue = filterResolved(channel.take_queue);

		// immediate take?
		if (channel.messages.length > 0) {
			msg = channel.messages.shift();
			unblock(channel.put_queue.shift());
			if (msg instanceof Error) {
				throw msg;
			}
			return msg;
		}
		// queued take
		else {
			channel.take_queue.push(
				// make a notifiable iterable for 'take' blocking
				ASQ.iterable()
				.then(function __then__(){
					if (!channel.closed) {
						var v = channel.messages.shift();
						if (v instanceof Error) {
							throw v;
						}
						return v;
					}
					else {
						return ASQ.csp.CLOSED;
					}
				})
			);

			// wrap a sequence/promise around the iterable
			msg = ASQ(
				channel.take_queue[channel.take_queue.length - 1]
			);

			// put waiting on this take?
			if (channel.put_queue.length > 0) {
				unblock(channel.put_queue.shift());
				unblock(channel.take_queue.shift());
			}

			return msg;
		}
	}

	function takemAsync(channel,cb) {
		var ret = ASQ(takem(channel));

		if (cb && typeof cb == "function") {
			ret.pThen(cb,cb);
		}
		else {
			return ret.val(function __val__(v){
				if (v instanceof Error) {
					throw v;
				}
				return v;
			});
		}
	}

	function alts(actions) {
		var closed, open, handlers, i, isq, ret, resolved = false;

		// used `alts(..)` incorrectly?
		if (!Array.isArray(actions) || actions.length == 0) {
			throw Error("Invalid usage");
		}

		closed = [];
		open = [];
		handlers = [];

		// separate actions by open/closed channel status
		actions.forEach(function __forEach__(action){
			var channel = Array.isArray(action) ? action[0] : action;

			// remove already-resolved entries
			channel.put_queue = filterResolved(channel.put_queue);
			channel.take_queue = filterResolved(channel.take_queue);

			if (channel.closed) {
				closed.push(channel);
			}
			else {
				open.push(action);
			}
		});

		// if no channels are still open, we're done
		if (open.length == 0) {
			return { value: ASQ.csp.CLOSED, channel: closed };
		}

		// can any channel action be executed immediately?
		for (i=0; i<open.length; i++) {
			// put action
			if (Array.isArray(open[i])) {
				// immediate put?
				if (open[i][0].messages.length < open[i][0].buffer_size) {
					return { value: put(open[i][0],open[i][1]), channel: open[i][0] };
				}
			}
			// immediate take?
			else if (open[i].messages.length > 0) {
				return { value: take(open[i]), channel: open[i] };
			}
		}

		isq = ASQ.iterable();
		var ret = ASQ(isq);

		// setup channel action handlers
		for (i=0; i<open.length; i++) {
			(function(action,channel,value){
				// put action?
				if (Array.isArray(action)) {
					channel = action[0];
					value = action[1];

					// define put handler
					handlers.push(
						ASQ.iterable()
						.then(function __then__(){
							resolved = true;

							// mark all handlers across this `alts(..)` as resolved now
							handlers = handlers.filter(function __filter__(handler){
								return !(handler.resolved = true);
							});

							// channel still open?
							if (!channel.closed) {
								channel.messages.push(value);
								isq.next({ value: true, channel: channel });
							}
							// channel already closed?
							else {
								isq.next({ value: false, channel: channel });
							}
						})
					);

					// queue up put handler
					channel.put_queue.push(handlers[handlers.length-1]);

					// take waiting on this queued put?
					if (channel.take_queue.length > 0) {
						ASQ.__schedule(function handleUnblocking(){
							if (!resolved) {
								unblock(channel.put_queue.shift());
								unblock(channel.take_queue.shift());
							}
						},0);
					}
				}
				// take action?
				else {
					channel = action;

					// define take handler
					handlers.push(
						ASQ.iterable()
						.then(function __then__(){
							resolved = true;

							// mark all handlers across this `alts(..)` as resolved now
							handlers = handlers.filter(function __filter__(handler){
								return !(handler.resolved = true);
							});

							// channel still open?
							if (!channel.closed) {
								isq.next({ value: channel.messages.shift(), channel: channel });
							}
							// channel already closed?
							else {
								isq.next({ value: ASQ.csp.CLOSED, channel: channel });
							}
						})
					);

					// queue up take handler
					channel.take_queue.push(handlers[handlers.length-1]);

					// put waiting on this queued take?
					if (channel.put_queue.length > 0) {
						ASQ.__schedule(function handleUnblocking(){
							if (!resolved) {
								unblock(channel.put_queue.shift());
								unblock(channel.take_queue.shift());
							}
						});
					}
				}
			})(open[i]);
		}

		return ret;
	}

	function altsAsync(chans,cb) {
		var ret = ASQ(alts(channel));

		if (cb && typeof cb == "function") {
			ret.pThen(cb,cb);
		}
		else {
			return ret;
		}
	}

	function timeout(delay) {
		var ch = channel();
		setTimeout(ch.close,delay);
		return ch;
	}

	function go(gen,args) {
		// goroutine arguments passed?
		if (arguments.length > 1) {
			if (!args || !Array.isArray(args)) {
				args = [args];
			}
		}
		else {
			args = [];
		}

		return function *__go__(token) {
			function extract() {
				ret = null;
				msg = arguments.length > 1 ?
					ASQ.messages.apply(null,arguments) :
					arguments[0]
				;
			}

			var ret, msg, err, type, done = false, it;

			// need to create a default channel for these goroutines?
			if (!token.channel) {
				token.channel = channel();
				token.channel.messages = token.messages;
				token.channel.go = function __go__(){
					token.add(go.apply(null,arguments));
				};
				// starting out with initial channel messages?
				if (token.channel.messages.length > 0) {
					// fake back-pressure blocking for each
					token.channel.put_queue = token.channel.messages.map(function __map__(){
						// make a notifiable iterable for 'put' blocking
						return ASQ.iterable()
						.then(function __then__(){
							unblock(token.channel.take_queue.shift());
							return !token.channel.closed;
						});
					});
				}
			}

			// keep track of how many goroutines are running
			// so we can imply when we're done go'ing
			token.go_count = (token.go_count || 0) + 1;

			// initialize the generator
			it = gen.apply(null,[token.channel].concat(args));

			while (!done) {
				if (!ret) {
					if (err) {
						ret = it.throw(err);
					}
					else {
						ret = it.next(msg);
					}
					done = ret.done;
					ret = ret.value;
					type = typeof ret;

					// received a thenable/promise back?
					// NOTE: `then` duck-typing of promises is stupid.
					if (!ASQ.isSequence(ret) &&
						ret != null &&
						(type == "object" || type == "function") &&
						typeof ret.then == "function"
					) {
						ret = ASQ().promise(ret);
					}

					// wait for the value?
					if (ASQ.isSequence(ret)) {
						ret.val(extract)
						.or(function(){
							extract.apply(null,arguments);
							if (msg instanceof Error) {
								err = msg;
								msg = null;
							}
						});
					}
					// immediate value, prepare it to go right back in
					else {
						msg = ret;
						ret = null;
						continue;
					}
				}

				// transfer control to next goroutine
				yield token;
			}

			// this goroutine is done now
			token.go_count--;

			// all goroutines done now?
			if (token.go_count === 0) {
				// capture any untaken messages
				msg = ASQ.messages.apply(null,token.messages);

				// need to implicitly force-close channel?
				if (token.channel && !token.channel.closed) {
					token.channel.closed = true;
					token.channel.put_queue.length = token.channel.take_queue.length = 0;
					token.channel.close = token.channel.go = token.channel.messages = null;
				}
				token.channel = null;

				// make sure leftover messages (if any) are passed along
				yield msg;
			}
		};
	}

	var tmp;

	if (!(
		ASQ.iterable &&
		(tmp = ASQ()) &&
		tmp.pThen &&
		tmp.pCatch
	)) {
		throw Error("ASQ dependencies missing.");
	}

	ASQ.csp = {
		chan: channel,
		put: put,
		putAsync: putAsync,
		take: take,
		takeAsync: takeAsync,
		takem: takem,
		takemAsync: takemAsync,
		alts: alts,
		altsAsync: altsAsync,
		timeout: timeout,
		go: go,
		CLOSED: {}
	};

	// just return `ASQ` itself for convenience sake
	return ASQ;
});
