(function(name,context,dependency,definition){
	if (typeof module !== "undefined" && module.exports) module.exports = definition(require(dependency));
	else if (typeof define === "function" && define.amd) define([dependency],definition);
	else context[name] = definition(dependency);
})("ASQ_contrib_tests",this,this.ASQ || "asynquence",function(ASQ){
	"use strict";

	function defineTests(doneLogMsg) {

		function asyncDelayFn(delay) {
			return function(done) {
				setTimeout(done,delay);
			};
		}

		function PASS(testDone,testLabel) {
			doneLogMsg(testLabel + ": PASSED")();
			testDone();
		}

		function FAIL(testDone,testLabel) {
			doneLogMsg(testLabel + ": FAILED")();
			testDone.fail.apply(testDone,ARRAY_SLICE.call(arguments,2));
		}

		var ARRAY_SLICE = Array.prototype.slice;
		var ø = Object.create(null);
		var tests = [];

		tests.push(function(testDone){
			var label = "Contrib Test  #1", timeout;

			ASQ()
			.then(asyncDelayFn(200))
			.all(
				asyncDelayFn(400),
				asyncDelayFn(300),
				asyncDelayFn(200)
			)
			.then(function(){
				clearTimeout(timeout);
				PASS(testDone,label);
			})
			.or(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test  #2", timeout;

			ASQ("Hello")
			.any(
				function(done,msg){
					setTimeout(function(){
						done(msg,msg.toUpperCase());
					},500);
				},
				function(done,msg){
					done.fail("Bad");
				},
				function(done,msg){
					setTimeout(function(){
						done.fail("News");
					},250);
				},
				function(done,msg){
					done(msg.toLowerCase());
				}
			)
			.val(function(msg1,msg2,msg3,msg4){
				if (!(
					arguments.length === 4 &&
					ASQ.isMessageWrapper(msg1) &&
					msg1[0] === "Hello" &&
					msg1[1] === "HELLO" &&
					typeof msg2 === "undefined" &&
					typeof msg3 === "undefined" &&
					msg4 === "hello"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.any(
				function(done,msg){
					setTimeout(function(){
						done.fail("Looks","good");
					},250);
				},
				function(done,msg){
					done.fail("now");
				}
			)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2){
				clearTimeout(timeout);

				if (
					arguments.length === 2 &&
					ASQ.isMessageWrapper(msg1) &&
					msg1[0] === "Looks" &&
					msg1[1] === "good" &&
					msg2 === "now"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test  #3", timeout;

			ASQ("Hello")
			.first(
				function(done,msg){
					setTimeout(function(){
						done(msg,msg.toUpperCase());
					},500);
				},
				function(done,msg){
					done.fail("Bad");
				},
				function(done,msg){
					setTimeout(function(){
						done.fail("News");
					},250);
				},
				function(done,msg){
					setTimeout(function(){
						done("Ignored, too late");
					},750);
				}
			)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					ASQ.isMessageWrapper(msg) &&
					msg[0] === "Hello" &&
					msg[1] === "HELLO"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.first(
				function(done){
					setTimeout(function(){
						done.fail("Looks","good");
					},250);
				},
				function(done){
					done.fail("now");
				}
			)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2){
				clearTimeout(timeout);

				if (
					arguments.length === 2 &&
					ASQ.isMessageWrapper(msg1) &&
					msg1[0] === "Looks" &&
					msg1[1] === "good" &&
					msg2 === "now"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test  #4", timeout;

			ASQ("Hello")
			.last(
				function(done,msg){
					done.fail("Bad");
				},
				function(done,msg){
					setTimeout(function(){
						done(msg,msg.toUpperCase());
					},400);
				},
				function(done,msg){
					setTimeout(function(){
						done(msg.toLowerCase());
					},300);
				},
				function(done,msg){
					setTimeout(function(){
						done.fail("News");
					},250);
				}
			)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					ASQ.isMessageWrapper(msg) &&
					msg[0] === "Hello" &&
					msg[1] === "HELLO"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.last(
				function(done){
					setTimeout(function(){
						done.fail("Looks","good");
					},250);
				},
				function(done){
					done.fail("now");
				}
			)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2){
				clearTimeout(timeout);

				if (
					arguments.length === 2 &&
					ASQ.isMessageWrapper(msg1) &&
					msg1[0] === "Looks" &&
					msg1[1] === "good" &&
					msg2 === "now"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test  #5", timeout;

			ASQ("Hello")
			.none(
				function(done,msg){
					setTimeout(function(){
						done.fail("Looks","good");
					},250);
				},
				function(done,msg){
					done.fail("so far");
				}
			)
			.val(function(msg1,msg2){
				if (!(
					arguments.length === 2 &&
					ASQ.isMessageWrapper(msg1) &&
					msg1[0] === "Looks" &&
					msg1[1] === "good" &&
					msg2 === "so far"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.none(
				function(done){
					done.fail("Bad");
				},
				function(done){
					setTimeout(function(){
						done("Hello");
					},400);
				},
				function(done){
					done("world","it's me!");
				},
				function(done){
					setTimeout(function(){
						done.fail("News");
					},250);
				}
			)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2,msg3,msg4){
				clearTimeout(timeout);

				if (
					arguments.length === 4 &&
					typeof msg1 === "undefined" &&
					msg2 === "Hello" &&
					ASQ.isMessageWrapper(msg3) &&
					msg3[0] === "world" &&
					msg3[1] === "it's me!" &&
					typeof msg4 === "undefined"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test  #6", timeout, counter = 0;

			ASQ(3)
			.until(
				function(done,msg){
					setTimeout(function(){
						counter++;
						if (counter < msg) {
							done.fail();
						}
						else {
							done(msg,msg * 2);
						}
					},10);
				},
				function(done,msg1,msg2){
					setTimeout(function(){
						counter++;
						if (counter < msg2) {
							done.fail();
						}
						else {
							done(msg1,msg2,msg2 * 2);
						}
					},10);
				}
			)
			.val(function(msg1,msg2,msg3){
				if (!(
					arguments.length === 3 &&
					msg1 === 3 &&
					msg2 === 6 &&
					msg3 === 12 &&
					counter === 6
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.until(
				function(done,msg){
					setTimeout(function(){
						counter++;
						if (counter > 10) {
							done.break(
								ASQ.messages("Stop","the","madness!")
							);
						}
						else {
							done.fail();
						}
					},10);
				}
			)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg){
				clearTimeout(timeout);

				if (
					arguments.length === 1 &&
					ASQ.isMessageWrapper(msg) &&
					msg[0] === "Stop" &&
					msg[1] === "the" &&
					msg[2] === "madness!" &&
					counter === 11
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test  #7", timeout;

			ASQ()
			.try(
				function(done){
					setTimeout(function(){
						done.fail("Hello");
					},100);
				},
				function(done,msg){
					if (
						arguments.length === 2 &&
						typeof msg === "object" &&
						msg.catch === "Hello"
					) {
						setTimeout(function(){
							done(msg.catch,"World");
						},100);
					}
					else {
						done.fail("Oops");
					}
				}
			)
			.val(function(msg1,msg2){
				clearTimeout(timeout);

				if (
					arguments.length === 2 &&
					msg1 === "Hello" &&
					msg2 === "World"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.or(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test  #8", timeout, isq,
				seed, ret
			;

			function step(num) {
				return num * 2;
			}

			// set up an iterable-sequence
			isq = ASQ.iterable()
				.then(step)
				.then(step)
				.then(step);

			// synchronously iterate the sequence
			for (seed = 3;
				!(ret && ret.done) && (ret = isq.next(seed));
			) {
				seed = ret.value;
			}

			if (seed !== 24) {
				FAIL(testDone,label,"WTF",seed);
				return;
			}

			// now, wire the iterable-sequence into
			// a normal sequence
			ASQ()
			.seq(isq)
			.val(function(msg1,msg2){
				if (!(
					arguments.length === 2 &&
					msg1 === "Awesome" &&
					msg2 === "sauce!"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
				else {
					isq.next();
					setTimeout(function(){
						// advance the iterable-sequence 2 steps, which
						// should keep the main sequence going
						isq.next("Hello","world");
					},100);
				}
			})
			.seq(isq,isq) // listen for two iterations
			.val(function(msg1,msg2){
				if (!(
					arguments.length === 2 &&
					msg1 === "Hello" &&
					msg2 === "world"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
				else {
					setTimeout(function(){
						// throw an error into the iterable-sequence,
						// which should throw the main sequence into
						// error
						isq.throw("Cool","beans");
					},100);
				}
			})
			.seq(isq)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2){
				clearTimeout(timeout);

				if (
					arguments.length === 2 &&
					msg1 === "Cool" &&
					msg2 === "beans"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			// advance the iterable-sequence a step, which should
			// restart the waiting sequence
			isq.next("Awesome","sauce!");

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test  #9", timeout, isq;

			// set up an iterable-sequence
			isq = ASQ.iterable();

			// now, wire the iterable-sequence into
			// a normal sequence
			ASQ(function(done){
				// wait for the iterable-sequence to advance
				// before the main sequence can proceed
				isq.pipe(done);

				setTimeout(function(){
					// advance the iterable-sequence a step, which should
					// keep the main sequence going
					isq.next("Hello","world");
				},100);
			})
			.val(function(msg1,msg2){
				if (!(
					arguments.length === 2 &&
					msg1 === "Hello" &&
					msg2 === "world"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.then(function(done){
				// throw an error into the iterable-sequence, which
				// should throw the main sequence into error
				isq.throw("Awesome","sauce!");

				// wait to listen for errors on the iterable-sequence
				// until well after it's been error'd
				setTimeout(function(){
					// wait for the iterable-sequence to advance
					// before the main sequence can proceed
					isq.pipe(done);
				},100);
			})
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2){
				clearTimeout(timeout);

				if (
					arguments.length === 2 &&
					msg1 === "Awesome" &&
					msg2 === "sauce!"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #10", timeout, sq, isq,
				loop, seed, ret;

			function step(num) {
				return num * 2;
			}

			function delay(done,msg) {
				setTimeout(done,50);
			}

			function iterate(msg) {
				var ret;
				if ((ret = isq.next(msg)) && !ret.done) {
					return ret.value;
				}
				else {
					// break the iteration loop
					throw "Iteration complete.";
				}
			}

			// set up an iterable-sequence
			isq = ASQ.iterable()
				.then(step)
				.then(step)
				.then(step)
				.then(function(){
					throw "Should not get here!";
				})
				.or(function(msg){
					if (!(
						arguments.length === 1 &&
						msg === "Too big!"
					)) {
						clearTimeout(timeout);
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					}
				});

			// set up an async loop sequence controller
			loop = ASQ()
			.or(function(msg){
				clearTimeout(timeout);

				if (
					arguments.length === 1 &&
					msg === "Iteration complete." &&
					seed === 24
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			// asynchronously iterate the sequence
			(function next(msg){
				if (msg > 15) {
					// throw an error into the iterable
					// sequence
					isq.throw("Too big!");
				}

				// store seed so we can check it at the end
				seed = msg;

				loop
				.then(delay)
				.val(msg,iterate,next);
			})(3);

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #11", timeout,
				isq1, isq2, res1, res2
			;

			function step(num) {
				return num * 2;
			}

			function iterate(isq,seed) {
				return ASQ(function(done){
					(function doIteration(seed){
						var ret;

						try {
							ret = isq.next(seed);
						}
						catch (err) {
							done.fail(err);
							return;
						}

						if (!ret.done) {
							setTimeout(function(){
								doIteration(ret.value);
							},10);
						}
						else {
							done(ret.value);
						}
					})(seed);
				});
			}

			// set up an iterable-sequence
			isq1 = ASQ.iterable();

			isq1
			.then(step)
			.then(step)
			.then(step);

			isq2 = isq1.duplicate();

			isq1
			.then(step)
			.or(function(){
				console.error("isq1 error");
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			});

			isq2
			.then(step)
			.then(step)
			.or(function(){
				console.error("isq2 error");
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			});

			ASQ()
			.gate(
				function(done){
					iterate(isq1,2).pipe(done);
				},
				function(done){
					iterate(isq2,3).pipe(done);
				}
			)
			.val(function(msg1,msg2){
				clearTimeout(timeout);

				if (
					msg1 === 32 &&
					msg2 === 96
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.or(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #12", timeout;

			function step(done) {
				var args = ARRAY_SLICE.call(arguments,1);
				setTimeout(function(){
					var sum = 0;
					args.forEach(function(arg){
						sum += (typeof arg === "number") ? arg : arg[1];
					});

					if (sum % 2 === 1) done(sum,sum*2);
					else done(sum*2+1);
				},100);
			}

			function broken(done) {
				var args = ARRAY_SLICE.call(arguments,1);
				setTimeout(function(){
					done.fail.apply(done,args);
				},100);
			}

			ASQ(3)
			.waterfall(
				step,
				step,
				step,
				step
			)
			.val(function(msg1,msg2,msg3,msg4){
				if (!(
					arguments.length === 4 &&
					Array.isArray(msg1) &&
					msg1.length === 2 &&
					msg1[0] === 3 &&
					msg1[1] === 6 &&
					msg2 === 13 &&
					Array.isArray(msg3) &&
					msg3.length === 2 &&
					msg3[0] === 19 &&
					msg3[1] === 38 &&
					Array.isArray(msg4) &&
					msg4.length === 2 &&
					msg4[0] === 57 &&
					msg4[1] === 114
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
				else {
					return 5;
				}
			})
			.waterfall(
				step,
				step,
				broken,
				function(){
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2){
				clearTimeout(timeout);

				if (
					arguments.length === 2 &&
					Array.isArray(msg1) &&
					msg1.length === 2 &&
					msg1[0] === 5 &&
					msg1[1] === 10 &&
					msg2 === 21
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #13", timeout;

			function Ef(err,msg,delay,cb) {
				setTimeout(function(){
					if (!Array.isArray(err)) err = [err];
					if (!Array.isArray(msg)) msg = [msg];
					msg = err.concat(msg);
					cb.apply(ø,msg);
				},delay);
			}

			var sq = ASQ("Hello");

			Ef(void 0,["World","!"],100,sq.errfcb());

			sq.val(function(msg1,msg2){
				if (!(
					arguments.length === 2 &&
					msg1 === "World" &&
					msg2 === "!"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.or(function(msg){
				clearTimeout(timeout);

				if (
					arguments.length === 1 &&
					msg === "All done"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			Ef("All done","Ignored",200,sq.errfcb());

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #14", timeout;

			ASQ("*","@")
			.map(["Hello","World","!"],function(item,done,pre,post){
				setTimeout(function(){
					done(pre + item.toUpperCase() + post);
				},200);
			})
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg.length === 3 &&
					// `msg` should just be a normal array!
					!ASQ.isMessageWrapper(msg) &&
					msg[0] === "*HELLO@" &&
					msg[1] === "*WORLD@" &&
					msg[2] === "*!@"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}

				// push the array as value-message onto
				// stream, for subsequent `map(..)` to use
				return ["foo","bar","baz"];
			})
			.map(function(item,done){
				done(item.toUpperCase());
			})
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg.length === 3 &&
					// `msg` should just be a normal array!
					!ASQ.isMessageWrapper(msg) &&
					msg[0] === "FOO" &&
					msg[1] === "BAR" &&
					msg[2] === "BAZ"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}

				// push the array AND iterator as value-messages
				// onto stream, for subsequent `map()` to use,
				// and also push another value-message which
				// should pass to the iterator itself
				return ASQ.messages(
					/*arr=*/["Hello","World"],
					/*each=*/function(item,done,msg){
						done(item + msg);
					},
					/*msg=*/"!"
				);
			})
			// gets both array and iterator from value messages
			.map()
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg.length === 2 &&
					// `msg` should just be a normal array!
					!ASQ.isMessageWrapper(msg) &&
					msg[0] === "Hello!" &&
					msg[1] === "World!"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.map(function(item,done){
				setTimeout(function(){
					// we hate even numbers! :)
					if (item % 2 === 0) {
						done.fail("Evil Even");
					}
					else {
						done(item / 2);
					}
				},100);
			},[1,2,3])
			.val(function(){
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg){
				clearTimeout(timeout);

				if (
					arguments.length === 1 &&
					msg === "Evil Even"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #15", timeout,
				isq, Q = tests.Q
			;

			function doubleSeq(x) {
				return ASQ(function(done){
					setTimeout(function(){
						if (x < 100) {
							done(x * 2);
						}
						else {
							done.fail("Too big!");
						}
					},50);
				});
			}

			function doublePromise(x) {
				var def = Q.defer();
				setTimeout(function(){
					if (x < 100) {
						def.resolve(x * 2);
					}
					else {
						def.reject("Too big!");
					}
				},50);
				return def.promise;
			}

			function justValue(x) {
				return x;
			}

			function twiceValues(x) {
				return ASQ.messages(x,x);
			}

			ASQ(2)
			.runner(
				ASQ.iterable()
				.then(doubleSeq)
				.then(doublePromise)
				.then(doubleSeq)
				.then(doublePromise)
				.then(twiceValues) // return the value itself, twice
			)
			.val(function(msg1,msg2){
				if (!(
					arguments.length === 2 &&
					msg1 === 32 &&
					msg2 === 32
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.then(function(done){
				ASQ(42)
				.runner(
					ASQ.iterable()
					.then(justValue) // just returns the value directly
					.then(doubleSeq)
					.then(doubleSeq)
					.then(doubleSeq)
				)
				.val(function(){
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				})
				.or(function(msg){
					if (
						arguments.length === 1 &&
						msg === "Too big!"
					) {
						done();
					}
					else {
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					}
				});
			})
			.then(function(done){
				ASQ(42)
				.runner(
					ASQ.iterable()
					.then(doublePromise)
					.then(doublePromise)
					.then(doublePromise)
				)
				.pipe(done);
			})
			.val(function(){
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg){
				clearTimeout(timeout);

				if (
					arguments.length === 1 &&
					msg === "Too big!"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},1000);
		});

		return tests;
	}

	return defineTests;
});
