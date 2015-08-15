(function(name,context,definition){
	if (typeof module !== "undefined" && module.exports) module.exports = definition();
	else if (typeof define === "function" && define.amd) define(definition);
	else context[name] = definition();
})("ASQ_contrib_tests",this,function(){
	"use strict";

	function defineTests(ASQ,doneLogMsg) {

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
			.gate(
				ASQ.after(300,"Hello"),
				ASQ.after(200,"World","!")
			)
			.val(function(msg1,msg2){
				if (!(
					arguments.length === 2 &&
					msg1 === "Hello" &&
					ASQ.isMessageWrapper(msg2) &&
					msg2[0] === "World" &&
					msg2[1] === "!"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return msg1 + " " + msg2[0] + msg2[1];
			})
			.after(50)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "Hello World!"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return "Ignored message";
			})
			.after(50,42)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === 42
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return "Ignored message";
			})
			.then(function(done){
				ASQ("Hello")
				.failAfter(25)
				.val(done.fail)
				.or(done);
			})
			.val(function(){
				if (arguments.length > 0) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return "Ignored message";
			})
			.then(function(done){
				ASQ()
				.gate(
					ASQ.failAfter(200,"Hello everyone!"),
					ASQ.failAfter(100,"This","is","great!"),
					ASQ("Ignored message").failAfter(150)
				)
				.pipe(done);
			})
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2,msg3){
				clearTimeout(timeout);

				if (
					arguments.length === 3 &&
					msg1 === "This" &&
					msg2 === "is" &&
					msg3 === "great!"
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
			},2000);
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
				},
				// passing in some sequences directly
				ASQ.failed("failed"),
				ASQ(function(done){
					setTimeout(function(){
						done("Super","Duper!");
					},600);
				})
			)
			.val(function(msg1,msg2,msg3,msg4,msg5,msg6){
				if (!(
					arguments.length === 6 &&
					ASQ.isMessageWrapper(msg1) &&
					msg1[0] === "Hello" &&
					msg1[1] === "HELLO" &&
					typeof msg2 === "undefined" &&
					typeof msg3 === "undefined" &&
					msg4 === "hello" &&
					typeof msg5 === "undefined" &&
					ASQ.isMessageWrapper(msg6) &&
					msg6[0] === "Super" &&
					msg6[1] === "Duper!"
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
				ASQ.failed("now")
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
			},2000);
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
				},
				// passing in some sequences directly
				ASQ.failed("failed"),
				ASQ(function(done){
					setTimeout(function(){
						done("Also ignored, too late");
					},600);
				})
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
				ASQ.failed("failure ignored"),
				ASQ("all","good"),
				ASQ(function(done){
					setTimeout(function(){
						done("Ignored message");
					},100);
				})
			)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					ASQ.isMessageWrapper(msg) &&
					msg[0] === "all" &&
					msg[1] === "good"
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
				ASQ.failed("and","failed"),
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
			.or(function(msg1,msg2,msg3){
				clearTimeout(timeout);

				if (
					arguments.length === 3 &&
					ASQ.isMessageWrapper(msg1) &&
					msg1[0] === "Looks" &&
					msg1[1] === "good" &&
					ASQ.isMessageWrapper(msg2) &&
					msg2[0] === "and" &&
					msg2[1] === "failed" &&
					msg3 === "now"
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
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test  #4", timeout;

			ASQ("Hello")
			.last(
				function(done,msg){
					done.fail("Bad");
				},
				ASQ(function(done){
					setTimeout(function(){
						done("yeah","YEAH");
					},500);
				}),
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
				ASQ.failed("News")
			)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					ASQ.isMessageWrapper(msg) &&
					msg[0] === "yeah" &&
					msg[1] === "YEAH"
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
				},
				ASQ.failed("yeah","yeah!")
			)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2,msg3){
				clearTimeout(timeout);

				if (
					arguments.length === 3 &&
					ASQ.isMessageWrapper(msg1) &&
					msg1[0] === "Looks" &&
					msg1[1] === "good" &&
					msg2 === "now" &&
					ASQ.isMessageWrapper(msg3) &&
					msg3[0] === "yeah" &&
					msg3[1] === "yeah!"
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
			},2000);
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
				},
				ASQ.failed("and","still")
			)
			.val(function(msg1,msg2,msg3){
				if (!(
					arguments.length === 3 &&
					ASQ.isMessageWrapper(msg1) &&
					msg1[0] === "Looks" &&
					msg1[1] === "good" &&
					msg2 === "so far" &&
					ASQ.isMessageWrapper(msg3) &&
					msg3[0] === "and" &&
					msg3[1] === "still"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.none(
				ASQ.failed("Bad"),
				function(done){
					setTimeout(function(){
						done("Hello");
					},400);
				},
				function(done){
					done("world","it's me!");
				},
				ASQ("Ah","Ha!"),
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
			.or(function(msg1,msg2,msg3,msg4,msg5){
				clearTimeout(timeout);

				if (
					arguments.length === 5 &&
					typeof msg1 === "undefined" &&
					msg2 === "Hello" &&
					ASQ.isMessageWrapper(msg3) &&
					msg3[0] === "world" &&
					msg3[1] === "it's me!" &&
					ASQ.isMessageWrapper(msg4) &&
					msg4[0] === "Ah" &&
					msg4[1] === "Ha!" &&
					typeof msg5 === "undefined"
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
			},2000);
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
							done["break"](
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
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test  #7", timeout;

			ASQ()
			["try"](
				function(done){
					setTimeout(function(){
						done.fail("Hello");
					},10);
				},
				function(done,msg){
					if (
						arguments.length === 2 &&
						typeof msg === "object" &&
						msg["catch"] === "Hello"
					) {
						setTimeout(function(){
							done(msg["catch"],"World");
						},10);
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
			},2000);
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
				(ret = isq.next(seed)) && !ret.done;
			) {
				seed = ret.value;
			}

			if (seed !== 24) {
				FAIL(testDone,label,seed);
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
					},10);
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
						isq["throw"]("Cool","beans");
					},10);
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
			},2000);
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
				},10);
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
				isq["throw"]("Awesome","sauce!");

				// wait to listen for errors on the iterable-sequence
				// until well after it's been error'd
				setTimeout(function(){
					// wait for the iterable-sequence to advance
					// before the main sequence can proceed
					isq.pipe(done);
				},10);
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
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #10", timeout, sq, isq,
				loop, seed, ret;

			function step(num) {
				return num * 2;
			}

			function delay(done,msg) {
				setTimeout(done,10);
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
					isq["throw"]("Too big!");
				}

				// store seed so we can check it at the end
				seed = msg;

				loop
				.then(delay)
				.val(msg,iterate,next);
			})(3);

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #11", timeout,
				isq1, isq2, isq3, isq4, res1, res2
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
							done(seed);
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

			isq3 = ASQ.iterable();
			isq3["throw"]("isq3 error");

			isq4 = ASQ.iterable().defer();
			isq4["throw"]("isq4 error");

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

				if (!(
					arguments.length === 2 &&
					msg1 === 32 &&
					msg2 === 96
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.seq(isq3)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(err){
				clearTimeout(timeout);

				if (
					arguments.length === 1 &&
					err === "isq3 error"
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
			},2000);
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
				},10);
			}

			function broken(done) {
				var args = ARRAY_SLICE.call(arguments,1);
				setTimeout(function(){
					done.fail.apply(done,args);
				},10);
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
			},2000);
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
			},2000);
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
				},10);
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
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #15", timeout,
				isq
			;

			function doubleSeq(x) {
				return ASQ(function(done){
					setTimeout(function(){
						if (x < 100) {
							done(x * 2);
						}
						else {
							done.fail("Too big!",x);
						}
					},10);
				});
			}

			function doublePromise(x) {
				return new Promise(function(resolve,reject){
					setTimeout(function(){
						if (x < 100) {
							resolve(x * 2);
						}
						else {
							reject(ASQ.messages("Too big!",x));
						}
					},10);
				});
			}

			function doubleThunk(x) {
				return function thunk(cb) {
					setTimeout(function(){
						// cb is an error-first style callback
						cb(null,x * 2);
					},20);
				};
			}

			function justValue(x) {
				return x;
			}

			function twiceValues(x) {
				return ASQ.messages(x,x);
			}

			function extractTokenMessage(token) {
				return token.messages[0];
			}

			ASQ(2)
			.runner(
				ASQ.iterable()
					.val(extractTokenMessage)
					.then(doubleSeq)
					.then(doublePromise)
					.then(doubleThunk)
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
						.val(extractTokenMessage)
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
				.or(function(msg1,msg2){
					if (
						arguments.length === 2 &&
						msg1 === "Too big!" &&
						msg2 === 168
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
			.gate(
				function(done){
					ASQ()
					.runner(
						ASQ.iterable()
							.then(function(){ return 42; })
							.then(function(){})
					)
					.pipe(done);
				},
				function(done){
					ASQ()
					.runner(
						ASQ.iterable()
							.then(function(){ return 42; })
							.then(function(){ return null; })
					)
					.pipe(done);
				},
				function(done){
					ASQ()
					.runner(
						ASQ.iterable()
							.then(function(){ return 42; })
							.then(function(){ return ASQ.messages(); })
					)
					.pipe(done);
				},
				function(done){
					ASQ()
					.runner(
						ASQ.iterable()
							.then(function(){ return 42; })
							.then(function(){ return ASQ.messages(undefined); })
					)
					.pipe(done);
				},
				function(done){
					ASQ()
					.runner(
						ASQ.iterable()
							.then(function(){ return 42; })
							.then(function(){ return ASQ.messages(undefined,43); })
					)
					.pipe(done);
				}
			)
			.val(function(msg1,msg2,msg3,msg4,msg5){
				if (!(
					arguments.length === 5 &&
					msg1 === 42 &&
					msg2 === null &&
					msg3 === undefined &&
					msg4 === undefined &&
					Array.isArray(msg5) &&
					msg5.length === 2 &&
					msg5[0] === undefined &&
					msg5[1] === 43
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.then(function(done){
				ASQ(30)
				.runner(
					ASQ.iterable()
						.val(extractTokenMessage)
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
			.or(function(msg1,msg2){
				clearTimeout(timeout);

				if (
					arguments.length === 2 &&
					msg1 === "Too big!" &&
					msg2 === 120
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
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #16", timeout, isq;

			function doubleSeq(x) {
				return ASQ(function(done){
					setTimeout(function(){
						if (x < 2000) {
							done(x * 2);
						}
						else {
							done.fail("Too big!",x);
						}
					},10);
				});
			}

			function doublePromise(x) {
				return new Promise(function(resolve,reject){
					setTimeout(function(){
						if (x < 2000) {
							resolve(x * 2);
						}
						else {
							reject(ASQ.messages("Too big!",x));
						}
					},10);
				});
			}

			function justValue(x) {
				return x;
			}

			function twiceValues(x) {
				return ASQ.messages(x,x);
			}

			function extractTokenMessage(token) {
				return token.messages[0];
			}

			function addA(token) {
				token.messages[0] += "A";
				return token;
			}

			function addB(token) {
				token.messages[0] += "B";
				return token;
			}

			function addC(token) {
				token.messages[0] += "C";
				return token;
			}

			ASQ(2)
			.runner(
				ASQ.iterable()
					.val(function(token){
						// dynamically add these to the run
						token.add(
							ASQ.iterable()
								.val(extractTokenMessage)
								.then(doubleSeq)
								.then(doublePromise)
								.then(doubleSeq)
								.then(doublePromise),
							ASQ.iterable()
								.then(doublePromise)
								.then(doubleSeq),
							ASQ.iterable()
								.then(doubleSeq)
								.then(doublePromise)
								.then(doubleSeq)
								.then(twiceValues)
						);

						return token;
					})
			)
			.val(function(msg1,msg2){
				if (!(
					arguments.length === 2 &&
					msg1 === 1024 &&
					msg2 === 1024
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.runner(
				ASQ.iterable()
					.then(function(){ return null; })
					.then(function(msg){ return msg; })
					.then(function(msg){ return msg; })
			)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === null
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return "";
			})
			.runner(
				ASQ.iterable()
					.then(addA)
					.then(addA)
					.then(addA),
				ASQ.iterable()
					.then(addB)
					.then(addB),
				ASQ.iterable()
					.then(addC)
					.then(addC)
					.then(addC)
					.then(addC)
					.then(addC)
					.then(function(token){
						return token.messages[0];
					})
			)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "ABCABCACCC"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				// seed the next `runner(..)` call
				return 2;
			})
			.runner(
				ASQ.iterable()
					.val(extractTokenMessage)
					.then(doubleSeq)
					.then(doubleSeq)
					.then(doubleSeq)
					.then(doubleSeq)
					.then(doubleSeq)
					.then(doubleSeq),
				ASQ.iterable()
					.then(doublePromise)
					.then(doublePromise)
					.then(doublePromise)
					.then(doublePromise)
					.then(doublePromise)
					.then(doublePromise)
			)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2){
				clearTimeout(timeout);

				if (msg1 === "Too big!" &&
					msg2 === 2048
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
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #17", timeout, sq, isq, p;

			isq = ASQ.iterable();

			sq = ASQ(function(done){
				setTimeout(function(){
					isq.next(10);
				},20);
				setTimeout(function(){
					done(10);
				},10);
			});

			p = sq.toPromise()
			.then(function(msg){
				return msg * 2;
			});

			sq
			.promise(
				Promise.all([
					p,
					// cast iterable-sequence to sequence
					// so we can vend/fork a promise off it
					ASQ().seq(isq).toPromise()
				])
			)
			.val(function(msgs){
				if (!(
					arguments.length === 1 &&
					Array.isArray(msgs) &&
					msgs.length === 2 &&
					msgs[0] === 20 &&
					msgs[1] === 10
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}
			})
			.then(function(done){
				setTimeout(function(){
					done.fail(42);
				},10);
			});

			sq.toPromise()
			.then(
				function(){
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				},
				function(msg){
					clearTimeout(timeout);

					if (msg === 42) {
						PASS(testDone,label);
					}
					else {
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					}
				}
			);

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #18", timeout, rsq;

			rsq = ASQ.react(function(proceed){
				var sq1, sq2, sq3, sq4, self = this;

				if (!(
					self &&
					rsq &&
					self === rsq &&
					self.stop &&
					self.stop === rsq.stop &&
					typeof self.stop === "function"
				)) {
					clearTimeout(timeout);
					FAIL(testDone,label,"rsq.stop !== this.stop");
					return;
				}

				setTimeout(function(){
					sq1 = proceed();
				},10);
				setTimeout(function(){
					sq2 = proceed(3,4);
				},10);
				setTimeout(function(){
					sq3 = proceed(5,10);

					ASQ()
					.gate(
						sq1.pipe,
						sq2.pipe,
						sq3.pipe
					)
					.val(function(msg1,msg2,msg3){
						if (!(
							arguments.length === 3 &&
							msg1 === 20 &&
							msg2 === 14 &&
							msg3 === 30
						)) {
							clearTimeout(timeout);
							var args = ARRAY_SLICE.call(arguments);
							args.unshift(testDone,label);
							FAIL.apply(FAIL,args);
						}
					})
					.then(function(done){
						setTimeout(function(){
							sq4 = proceed(50,75).pipe(done);
						},300);
					})
					.val(function(){
						clearTimeout(timeout);
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					})
					.or(function(err){
						clearTimeout(timeout);

						if (
							arguments.length === 1 &&
							err === "Disabled Sequence"
						) {
							PASS(testDone,label);
						}
						else {
							var args = ARRAY_SLICE.call(arguments);
							args.unshift(testDone,label);
							FAIL.apply(FAIL,args);
						}
					});
				},30);

				setTimeout(function(){
					self.stop(); // stop the reactive sequence
				},100);
			})
			.val(function(msg1,msg2){
				return ((msg1 + msg2) || 10);
			})
			.then(function(done,msg){
				setTimeout(function(){
					done(msg * 2);
				},10);
			})
			.or(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #19", timeout, rsq, text = "",
				writable, makeStream
			;

			try {
				makeStream = (writable = require("stream").Writable) &&
					function() { return new writable(); }
				;
			}
			catch (err) {
				makeStream = fakeDuplexStream;
			}

			// make a stream that pumps `data` at `interval` ms,
			// then closes after `limit` events sent
			function setupStream(data,interval,limit) {
				var stream = makeStream(), count = 0, intv;

				intv = setInterval(function(){
					if (++count > limit) {
						clearInterval(intv);
						stream.emit("end");
						return;
					}

					stream.emit("data",data);
				},interval);

				return stream;
			}

			function setupErrorStream(data,delay) {
				var stream = makeStream();
				setTimeout(function(){
					stream.emit("data",data);
				},delay);
				setTimeout(function(){
					stream.emit("error",data.toLowerCase());
				},delay * 2);
				return stream;
			}


			rsq = ASQ.react(function(proceed,registerTeardown){
				var stream1 = setupStream("A",25,5);
				var stream2 = setupStream("B",30,2);
				var stream3 = setupErrorStream("C",40);

				proceed.onStream(stream1,stream2,stream3);

				ASQ()
				.gate(
					function(done){
						stream1.on("end",done);
					},
					function(done){
						stream2.on("end",done);
					},
					function(done){
						stream3.on("error",done);
					}
				)
				.val(function(){
					rsq.stop();
				})
				.or(function(){
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				});

				registerTeardown(function(){
					clearTimeout(timeout);

					proceed.unStream(stream1,stream2,stream3);
					stream1.removeAllListeners("end");
					stream2.removeAllListeners("end");
					stream3.removeAllListeners("error");

					if (text === "ABCABAcAA") {
						PASS(testDone,label);
					}
					else {
						FAIL(testDone,label,text);
					}
				});
			});

			rsq
			.val(function(v){
				if (arguments.length === 1) {
					text += v;
				}
				else {
					clearTimeout(timeout);
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
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #20", timeout,
				rsq1, rsq2, rsq3, rsq4, rsq5, rsq6,
				text1 = "", text2 = "", text3 = "",
				text4 = "", text5 = "", text6 = ""
			;

			// make a fake stream that pumps `data` at `interval` ms,
			// until `limit` events sent
			function setupFakeStream(fn,data,interval,limit) {
				var count = 0, intv;

				intv = setInterval(function(){
					if (++count > limit) {
						clearInterval(intv);
						return;
					}

					fn(data);
				},interval);

				return stream;
			}

			rsq1 = ASQ.react(function(proceed){
				setupFakeStream(proceed,"A",25,10);
			});
			rsq2 = ASQ.react(function(proceed){
				setupFakeStream(proceed,"B",30,6);
			});

			rsq3 = ASQ.react.all(rsq1,rsq2);
			rsq4 = ASQ.react.any(rsq1,rsq2);

			// duplicate `rsq4` reactive sequence
			rsq5 = ASQ.react.all(rsq4);

			rsq6 = ASQ.react.distinct(
				ASQ.react.any(rsq1,rsq2,rsq3,rsq4,rsq5)
			);

			rsq1
			.val(function(v){
				if (arguments.length === 1) {
					text += v;
				}
				else {
					clearTimeout(timeout);
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
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #21", timeout;

			ASQ("Hello","World")
			.pThen(function(msgs){
				if (!(
					arguments.length === 1 &&
					ASQ.isMessageWrapper(msgs) &&
					msgs[0] === "Hello" &&
					msgs[1] === "World"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				msgs.push("!");

				return msgs;
			})
			.val(function(msg1,msg2,msg3){
				if (!(
					arguments.length === 3 &&
					msg1 === "Hello" &&
					msg2 === "World" &&
					msg3 === "!"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return 42;
			})
			.pThen(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === 42
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return msg * 2;
			})
			.pThen(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === 84
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return ASQ(function(done){
					setTimeout(function(){
						done("Oh","Yeah!");
					},100);
				});
			})
			.pThen(function(msgs){
				if (!(
					arguments.length === 1 &&
					ASQ.isMessageWrapper(msgs) &&
					msgs[0] === "Oh" &&
					msgs[1] === "Yeah!"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return new Promise(function(resolve,reject){
					setTimeout(function(){
						resolve(msgs.join(" ").toUpperCase() + "!");
					},100);
				});
			})
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "OH YEAH!!"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				throw "Can you handle it?";
			})
			.pThen(
				function(){
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				},
				function(err){
					if (!(
						arguments.length === 1 &&
						err === "Can you handle it?"
					)) {
						clearTimeout(timeout);
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
						return;
					}

					return err.toUpperCase();
				}
			)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "CAN YOU HANDLE IT?"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				throw ASQ.messages("Keep","It","Up");
			})
			.pThen(
				function(){
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				},
				function(errs){
					if (!(
						arguments.length === 1 &&
						ASQ.isMessageWrapper(errs) &&
						errs[0] === "Keep" &&
						errs[1] === "It" &&
						errs[2] === "Up"
					)) {
						clearTimeout(timeout);
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					}

					// NOTE: no return value here, on purpose
				}
			)
			.val(function(){
				if (arguments.length > 0) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				throw "Yep";
			})
			.pThen(
				function(){
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				},
				function(err){
					if (!(
						arguments.length === 1 &&
						err === "Yep"
					)) {
						clearTimeout(timeout);
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
						return;
					}

					return ASQ.messages(err.toUpperCase(),"!");
				}
			)
			// NOTE: intentionally `then(..)` instead of `pThen(..)` here
			.then(function(done,msg1,msg2){
				if (!(
					arguments.length === 3 &&
					msg1 === "YEP" &&
					msg2 === "!"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				var sq = ASQ()
				.pThen(
					function(){
						throw "OK";
					},
					function(){
						clearTimeout(timeout);
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
						sq.abort();
					}
				)
				.pCatch(
					function(err){
						if (!(
							arguments.length === 1 &&
							err === "OK"
						)) {
							clearTimeout(timeout);
							var args = ARRAY_SLICE.call(arguments);
							args.unshift(testDone,label);
							FAIL.apply(FAIL,args);
							sq.abort();
							return;
						}

						return err + "!!";
					}
				)
				.pThen(
					function(msg){
						if (!(
							arguments.length === 1 &&
							msg === "OK!!"
						)) {
							clearTimeout(timeout);
							var args = ARRAY_SLICE.call(arguments);
							args.unshift(testDone,label);
							FAIL.apply(FAIL,args);
							sq.abort();
							return;
						}

						throw ASQ.messages(msg.toLowerCase(),"yay!!");
					},
					function(){
						clearTimeout(timeout);
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
						sq.abort();
					}
				)
				.pCatch(function(errs){
					if (!(
						arguments.length === 1 &&
						ASQ.isMessageWrapper(errs) &&
						errs[0] === "ok!!" &&
						errs[1] === "yay!!"
					)) {
						clearTimeout(timeout);
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
						sq.abort();
						return;
					}

					throw (errs[0] + errs[1]);
				})
				.val(function(){
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					sq.abort();
				})
				.or(done);
			})
			.val(function(msg1,msg2,msg3){
				clearTimeout(timeout);

				if (
					arguments.length === 3 &&
					msg1 === "ok!!" &&
					msg2 === "yay!!" &&
					msg3 === "ok!!yay!!"
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
			},2000);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #22", ASQ2, ASQ3, freshy;

			// should we skip this test because we're not in node?
			if (!(typeof module !== "undefined" && module.exports)) {
				PASS(testDone,label + " (SKIPPED)");
				return;
			}

			freshy = require("freshy");

			// reset cached asynquence instance(s)
			try { freshy.unload("../asynquence"); } catch (err) {}
			try { freshy.unload("../asq.js"); } catch (err) {}

			ASQ2 = require("./test-extensions-1.js");
			try { ASQ2.messages(); } catch (err) {
				ASQ2 = ASQ2( ASQ.clone() );
			}

			// reset cached asynquence instance(s)
			try { freshy.unload("../asynquence"); } catch (err) {}
			try { freshy.unload("../asq.js"); } catch (err) {}

			ASQ3 = require("./test-extensions-2.js");
			try { ASQ3.messages(); } catch (err) {
				ASQ3 = ASQ3( ASQ.clone() );
			}

			// reset cached asynquence instance(s)
			try { freshy.unload("../asynquence"); } catch (err) {}
			try { freshy.unload("../asq.js"); } catch (err) {}

			try {
				ASQ2().foobar();
				ASQ3().bazbam();
			}
			catch (err) {
				FAIL(testDone,label,err,ASQ2(),ASQ3());
				return;
			}

			try {
				ASQ3().foobar();
				FAIL(testDone,label,"ASQ3().foobar()");
				return;
			} catch (err) {}

			try {
				ASQ2().bazbam();
				FAIL(testDone,label,"ASQ2().bazbam()");
				return;
			} catch (err) {}

			PASS(testDone,label);
		});
		tests.push(function(testDone){
			var label = "Contrib Test #23", timeout, isnan,
				_f1, _f1b, _f1c, _f1d, _f2, _f2b, _f3, _f4, _f5, _f6, _f7, _f7b,
				o1 = { asq_value: 42 }, o2 = { asq_value: "foobar" }
			;

			isnan = Number.isNaN ? Number.isNaN : function(x) {
				return typeof x == "number" && isNaN(x);
			};

			function f1(p1,p2,errfcb) {
				setTimeout(function(){
					if (p1 + p2 > 250) {
						errfcb("too big: " + (p1 + p2));
					}
					else {
						errfcb(void 0,p1 + p2);
					}
				},25);
			}
			function f2(errfcb,p1,p2) { return f1(p1,p2,errfcb); }
			function f3(p1,p2,successCB,errorCB) {
				setTimeout(function(){
					if (p1 + p2 > 250) {
						errorCB("too big: " + (p1 + p2));
					}
					else {
						successCB(p1 + p2);
					}
				},25);
			}
			function f4(successCB,errorCB,p1,p2) { return f3(p1,p2,successCB,errorCB); }
			function f5(p1,p2,simpleCB) {
				if (p1 + p2 > 250) {
					throw "too big: " + (p1 + p2);
				}
				setTimeout(function(){
					simpleCB(p1 + p2);
				},25);
			}
			function f6(simpleCB,p1,p2) { return f5(p1,p2,simpleCB); }
			function f7(errfcb) {
				/*jshint validthis:true */
				var self = this;
				setTimeout(function(){
					errfcb(void 0,self.asq_value);
				},25);
			}

			try {
				ASQ.wrap( f1, { errfcb: true, splitcb: true });
				FAIL(testDone,label,"errfcb + splitcb");
				return;
			} catch (err) {}
			try {
				ASQ.wrap( f1, { errfcb: true, simplecb: true });
				FAIL(testDone,label,"errfcb + simplecb");
				return;
			} catch (err) {}
			try {
				ASQ.wrap( f1, { splitcb: true, simplecb: true });
				FAIL(testDone,label,"splitcb + simplecb");
				return;
			} catch (err) {}
			try {
				ASQ.wrap( f1, { errfcb: false });
				FAIL(testDone,label,"errfcb:false");
				return;
			} catch (err) {}
			try {
				ASQ.wrap( f1, { errfcb: false, splitcb:false });
				FAIL(testDone,label,"errfcb:false + splitcb:false");
				return;
			} catch (err) {}
			try {
				ASQ.wrap( f1, { errfcb: false, splitcb:false, simplecb:false });
				FAIL(testDone,label,"errfcb:false + splitcb:false + simplecb:false");
				return;
			} catch (err) {}
			try {
				ASQ.wrap( f1, { params_first: true, params_last: true });
				FAIL(testDone,label,"params_first + params_last");
				return;
			} catch (err) {}

			_f1 = ASQ.wrap( f1 ); // assumes: errfcb:true, params_first:true
			_f2 = ASQ.wrap( f2, { params_last:true } ); // assumes: errfcb:true
			_f3 = ASQ.wrap( f3, { splitcb:true } ); // assumes: params_first:true
			_f4 = ASQ.wrap( f4, { splitcb:true, params_last:true } );
			_f5 = ASQ.wrap( f5, { simplecb:true } ); // assumes params_first:true
			_f6 = ASQ.wrap( f6, { simplecb:true, params_last:true } );
			_f7 = ASQ.wrap( f7 );
			_f7b = ASQ.wrap( f7, { this: o1 });

			// alternate forms of the params-first/last logic
			_f1b = ASQ.wrap( f1, { params_first: true });
			_f1c = ASQ.wrap( f1, { params_last: false });
			_f1d = ASQ.wrap( f1, { params_first: false, params_last: false });
			_f2b = ASQ.wrap( f2, { params_first: false });

			ASQ()
			.gate(
				_f1(10,20),
				_f2(30,40),
				_f3(50,60),
				_f4(70,80),
				_f5(90,100),
				_f6(110,120)
			)
			.val(function(msg1,msg2,msg3,msg4,msg5,msg6){
				if (!(
					arguments.length === 6 &&
					msg1 === 30 &&
					msg2 === 70 &&
					msg3 === 110 &&
					msg4 === 150 &&
					msg5 === 190 &&
					msg6 === 230
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.gate(
				_f7(),
				_f7.call(o1),
				_f7b(),
				_f7b.call(o2)
			)
			.val(function(msg1,msg2,msg3,msg4){
				if (!(
					arguments.length === 4 &&
					msg1 === undefined &&
					msg2 === 42 &&
					msg3 === 42 &&
					msg4 === "foobar"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.gate(
				_f1b(20,30),
				_f1c(40,50),
				_f1d(60,70),
				_f2b(80,90)
			)
			.val(function(msg1,msg2,msg3,msg4){
				if (!(
					arguments.length === 4 &&
					msg1 === 50 &&
					msg2 === 90 &&
					msg3 === 130 &&
					msg4 === 170
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.gate(
				_f1(void 0,void 0),
				_f2(),
				_f3(void 0,void 0),
				_f4(),
				_f5(void 0,void 0),
				_f6()
			)
			.val(function(msg1,msg2,msg3,msg4,msg5,msg6){
				if (!(
					arguments.length === 6 &&
					isnan(msg1) &&
					isnan(msg2) &&
					isnan(msg3) &&
					isnan(msg4) &&
					isnan(msg5) &&
					isnan(msg6)
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.gate(
				function(done){
					_f1(150,150).then(done.fail).or(done);
				},
				function(done){
					_f2(200,200).then(done.fail).or(done);
				},
				function(done){
					_f3(250,250).then(done.fail).or(done);
				},
				function(done){
					_f4(300,300).then(done.fail).or(done);
				},
				function(done){
					_f5(350,350).then(done.fail).or(done);
				},
				function(done){
					_f6(400,400).then(done.fail).or(done);
				}
			)
			.val(function(msg1,msg2,msg3,msg4,msg5,msg6){
				clearTimeout(timeout);

				if (
					arguments.length === 6 &&
					msg1 === "too big: 300" &&
					msg2 === "too big: 400" &&
					msg3 === "too big: 500" &&
					msg4 === "too big: 600" &&
					msg5 === "too big: 700" &&
					msg6 === "too big: 800"
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
			},2000);
		});

		return tests;
	}

	return defineTests;
});
