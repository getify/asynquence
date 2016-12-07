(function(name,context,dependency,definition){
	if (typeof module !== "undefined" && module.exports) module.exports = definition(require(dependency));
	else if (typeof define === "function" && define.amd) define([dependency],definition);
	else context[name] = definition(dependency);
})("ASQ_tests",this,this.ASQ || "./asq.src.js",function(ASQ){
	"use strict";

	function defineTests(doneLogMsg) {

		function asyncDelayFn(delay) {
			return function(done) {
				setTimeout(done,delay);
			};
		}

		function asyncDelaySeq(delay) {
			return ASQ(function(done){
				setTimeout(done,delay);
			});
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
			var label = "Core Test  #1", timeout, ASQ2;

			ASQ()
			.then(asyncDelayFn(100))
			.gate(function(done){
				done(1,2);
			})
			.val(function(msg){
				if (!(
					ASQ.isMessageWrapper( msg ) &&
					!ASQ.isMessageWrapper( ASQ() ) &&
					!ASQ.isMessageWrapper( [3,4] ) &&
					ASQ.isSequence( ASQ() ) &&
					!ASQ.isSequence( msg ) &&
					!ASQ.isSequence( {} )
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.then(function(){
				clearTimeout(timeout);
				PASS(testDone,label);
			})
			.onerror(function(){
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
			var label = "Core Test  #2", timeout;

			ASQ()
			.then(asyncDelaySeq(50))
			.then(function(done){
				asyncDelayFn(100)(function(){
					done("Hello World");
				});
			})
			.then(function(_,msg1){
				clearTimeout(timeout);
				if (msg1 === "Hello World") {
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
			var label = "Core Test  #3", timeout;

			ASQ()
			.then(function(done){
				asyncDelayFn(100)(function(){
					done("Hello");
				});
			})
			.then(function(done,msg1){
				asyncDelayFn(100)(function(){
					done(msg1,"World");
				});
			})
			.then(function(_,msg1,msg2){
				clearTimeout(timeout);
				if (msg1 === "Hello" && msg2 === "World") {
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
			var label = "Core Test  #4", timeout;

			ASQ()
			.then(function(done){
				asyncDelayFn(100)(function(){
					done.fail("Hello","World");
				});
			})
			.then(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2){
				clearTimeout(timeout);
				if (msg1 === "Hello" && msg2 === "World") {
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
			var label = "Core Test  #5", timeout;

			ASQ()
			.then(function(done){
				done.a.b; // throwing JS error to make sure it's caught and propagated
			})
			.then(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1){
				clearTimeout(timeout);
				if (msg1 instanceof Error) {
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
			var label = "Core Test #5b";

			ASQ()
			.then(function(done){
				// throwing JS error to make sure it's caught and propagated
				throw ASQ.messages("Oops","I","did","it","again!");
			})
			.then(function(){
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1,msg2,msg3,msg4,msg5){
				if (msg1 === "Oops" &&
					msg2 === "I" &&
					msg3 === "did" &&
					msg4 === "it" &&
					msg5 === "again!"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});
		});
		tests.push(function(testDone){
			var label = "Core Test #5c";

			ASQ()
			.then(function(done){
				// throwing JS error to make sure it's caught and propagated
				throw ASQ.messages("Oops","I","did","it","again!");
			})
			.or(function(){
				throw ASQ.messages("Oh","yeah!");
			})
			.or(function(msg1,msg2,msg3,msg4,msg5,msg6,msg7){
				if (msg1 === "Oops" &&
					msg2 === "I" &&
					msg3 === "did" &&
					msg4 === "it" &&
					msg5 === "again!" &&
					msg6 === "Oh" &&
					msg7 === "yeah!"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});
		});
		tests.push(function(testDone){
			var label = "Core Test  #6", timeout, delay_sq;

			delay_sq = asyncDelaySeq(600);

			ASQ()
			.then(asyncDelayFn(100))
			// using the `all(..)` alias of `gate(..)`
			.all(
				asyncDelayFn(800),
				delay_sq,
				asyncDelayFn(700)
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
			},2000);
		});
		tests.push(function(testDone){
			var label = "Core Test  #7", timeout;

			ASQ()
			.then(function(done){
				asyncDelayFn(100)(function(){
					done("msg1","msg2");
				});
			})
			.gate(
				function(done,msg1,msg2){
					asyncDelayFn(200)(function(){
						done(msg1,msg2,"Hello");
					});
				},
				function(done,msg1,msg2){
					asyncDelayFn(100)(function(){
						done(msg1+" "+msg2+" World");
					});
				}
			)
			.then(function(_,msg1,msg2){
				clearTimeout(timeout);

				if (ASQ.isMessageWrapper(msg1) &&
					msg1[0] === "msg1" &&
					msg1[1] === "msg2" &&
					msg1[2] === "Hello" &&
					msg2 === "msg1 msg2 World"
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
			var label = "Core Test  #8", timeout;

			ASQ()
			.then(asyncDelayFn(100))
			.gate(
				function(done){
					asyncDelayFn(100)(function(){
						done("Hello");
					});
				},
				function(done){
					ASQ()
					.gate(
						asyncDelayFn(200),
						// insert a failed sequence into the gate
						ASQ.failed("World")
					)
					.pipe(done);
				}
			)
			.then(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1){
				clearTimeout(timeout);

				if (msg1 === "World") {
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
			var label = "Core Test  #9", timeout;

			ASQ()
			.then(asyncDelayFn(100))
			.then(function(done){
				ASQ()
				.then(asyncDelayFn(100))
				.then(function(done){
					asyncDelayFn(100)(function(){
						done("Hello");
					});
				})
				.pipe(done);
			})
			.then(function(done,msg1){
				clearTimeout(timeout);

				if (msg1 === "Hello") {
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
			var label = "Core Test #10", timeout;

			ASQ()
			.then(asyncDelayFn(100))
			.then(function(done){
				ASQ()
				.then(asyncDelayFn(100))
				.then(
					ASQ(function(done){
						setTimeout(function(){
							done.fail("Hello");
						},100);
					})
				)
				.pipe(done);
			})
			.then(function(done){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1){
				clearTimeout(timeout);

				if (msg1 === "Hello") {
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
			var label = "Core Test #11", timeout;

			ASQ()
			.then(function(done){
				done("Hello");
			})
			.then(function(done,msg1){
				clearTimeout(timeout);

				if (msg1 === "Hello") {
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
			var label = "Core Test #12", timeout;

			ASQ
			.failed("Hello")
			.then(function(done){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1){
				clearTimeout(timeout);

				if (msg1 === "Hello") {
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
			var label = "Core Test #13", timeout;

			ASQ()
			.then(function(done){
				done("Hello");
				done.fail("World");
			})
			.then(function(done,msg1){
				clearTimeout(timeout);

				if (msg1 === "Hello") {
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
			var label = "Core Test #14", timeout;

			ASQ()
			.then(function(done){
				done.fail("Hello");
				done("World");
			})
			.then(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg1){
				clearTimeout(timeout);

				if (msg1 === "Hello") {
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
			var label = "Core Test #15", timeout, sq2, sq3;

			function doSeq(msg1,msg2) {
				var seq = ASQ();

				seq
				.then(asyncDelayFn(100))
				.then(function(done){
					done(msg2);
				});

				return seq;
			}

			function doSeq2() {
				var seq = ASQ();

				seq
				.then(asyncDelayFn(50))
				.then(function(done){
					done("Sweet");
				});

				return seq;
			}

			sq2 = doSeq2();

			sq3 = ASQ.failed("Yep");

			ASQ()
			.then(function(done){
				asyncDelayFn(100)(function(){
					done("Hello","World");
				});
			})
			.seq(doSeq)
			.val(function(msg){
				// did messages fail to flow through seq()?
				if (msg !== "World") {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}

				return "Ignored message";
			})
			// NOTE: passing in the sequence `sq2` itself
			.seq(sq2)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "Sweet"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return "Another ignored message";
			})
			// NOTE: passing in a failed sequence `sq3` itself
			.seq(sq3)
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg){
				clearTimeout(timeout);

				if (arguments.length === 1 &&
					msg === "Yep"
				) {
					PASS(testDone,label);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			// Note: these should not affect the main sequence above,
			// since `sq2` and `sq3` should be tapped immediately
			// at time of `seq(..)` calls.
			sq2.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "Sweet"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				return "OOPS!";
			});

			sq3.or(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "Yep"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
					return;
				}

				throw "Uh oh!";
			})
			// Note: deferring because we don't actually care about
			// this error!
			.defer();

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},2000);
		});
		tests.push(function(testDone){
			var label = "Core Test #16", timeout;

			function doSeq(msg1,msg2) {
				var seq = ASQ();

				seq
				.then(asyncDelayFn(250))
				// NOTE: calling doSeq2() to pass in ASQ instance itself
				.seq( doSeq2(msg2) );

				return seq;
			}

			function doSeq2(msg) {
				var seq = ASQ();

				seq
				.then(asyncDelayFn(50))
				// NOTE: calling doSeq3() to pass in ASQ instance itself
				.seq( doSeq3(msg + "!") );

				return seq;
			}

			function doSeq3(msg) {
				var seq = ASQ();

				seq
				.then(asyncDelayFn(100))
				.then(function(done){
					done.fail(msg.toUpperCase());
				});

				return seq;
			}

			ASQ()
			.then(function(done){
				asyncDelayFn(100)(function(){
					done("Hello","World");
				});
			})
			.seq(doSeq)
			.then(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg){
				clearTimeout(timeout);

				if (msg === "WORLD!") {
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
			var label = "Core Test #17", timeout;

			ASQ()
			.then(asyncDelayFn(100))
			.then(function(done){
				asyncDelayFn(100)(function(){
					done("Hello","World");
				});
			})
			.val(function(msg1,msg2){
				return msg1.toUpperCase() + " " + msg2.toUpperCase();
			})
			.then(function(_,msg1){
				clearTimeout(timeout);

				if (msg1 === "HELLO WORLD") {
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
			var label = "Core Test #18", timeout;

			ASQ()
			.val(function(){
				return ASQ.messages("Hello","World");
			})
			.then(function(_,msg1,msg2){
				clearTimeout(timeout);

				if (msg1 === "Hello" &&
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
			var label = "Core Test #19", timeout;

			ASQ(
				"Hello",
				"World",
				function(done,msg1,msg2){
					if (
						arguments.length === 3 &&
						msg1 === "Hello" &&
						msg2 === "World"
					) {
						done("So far so good");
					}
					else {
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					}
				},
				ASQ.messages("Yay","Nay"),
				function(done,msg1,msg2) {
					if (
						arguments.length === 3 &&
						msg1 === "Yay" &&
						msg2 === "Nay"
					) {
						done("Keep up the good work!");
					}
					else {
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					}
				},
				"Oh yeah"
			)
			.val(
				function(msg){
					if (!(
						arguments.length === 1 &&
						msg === "Oh yeah"
					)) {
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					}
				},
				"Ignored",
				"Also Ignored",
				ASQ.messages("Cool","Bro"),
				function(msg1,msg2){
					if (!(
						arguments.length === 2 &&
						msg1 === "Cool" &&
						msg2 === "Bro"
					)) {
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					}
				}
			)
			.val(
				"Nice",
				"Job",
				function(msg1,msg2){
					clearTimeout(timeout);

					if (arguments.length === 2 &&
						msg1 === "Nice" &&
						msg2 === "Job"
					) {
						PASS(testDone,label);
					}
					else {
						var args = ARRAY_SLICE.call(arguments);
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					}
				}
			)
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
			var label = "Core Test #20", timeout;

			function Pr(){
				var args = ASQ.messages.apply(ø,arguments);
				return new Promise(function(resolve){
					setTimeout(function(){
						resolve(args.length > 1 ? args : args[0]);
					},10);
				});
			}

			function bPr(){
				var args = ASQ.messages.apply(ø,arguments);
				return new Promise(function(_,reject){
					setTimeout(function(){
						reject(args.length > 1 ? args : args[0]);
					},10);
				});
			}

			ASQ("Hello")
			// generate 3 promises in succession,
			// using asynquence to chain them
			.promise(Pr,Pr,Pr)
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "Hello"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.promise(Pr("Hello","World"),Pr)
			.val(function(msg1,msg2){
				if (!(
					arguments.length === 2 &&
					msg1 === "Hello" &&
					msg2 === "World"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}

				return msg2.toUpperCase();
			})
			.promise(bPr) // Note: a broken promise!
			.val(function(){
				clearTimeout(timeout);
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg){
				clearTimeout(timeout);

				if (arguments.length === 1 &&
					msg === "WORLD"
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
			var label = "Core Test #21", timeout;

			function Ef(err,msg,delay,cb) {
				setTimeout(function(){
					if (!Array.isArray(err)) err = [err];
					if (!Array.isArray(msg)) msg = [msg];
					msg = err.concat(msg);
					cb.apply(ø,msg);
				},delay);
			}

			ASQ(function(done){
				Ef(/*err=*/void 0,/*success=*/["Yay","Man"],100,done.errfcb);
			})
			.val(function(msg1,msg2){
				if (!(
					arguments.length === 2 &&
					msg1 === "Yay" &&
					msg2 === "Man"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.gate(
				function(done){
					Ef(/*err=*/void 0,/*success=*/void 0,100,done.errfcb);
				},
				function(done){
					Ef(/*err=*/void 0,/*success=*/"Hello",200,done.errfcb);
				},
				function(done){
					done.errfcb(/*err=*/void 0,/*success=*/"World","!");
				}
			)
			.val(function(msg1,msg2,msg3){
				if (!(
					arguments.length === 3 &&
					msg1 === undefined &&
					msg2 === "Hello" &&
					ASQ.isMessageWrapper(msg3) &&
					msg3.length === 2 &&
					msg3[0] === "World" &&
					msg3[1] === "!"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.then(function(mainDone){
				ASQ(function(done){
					// force an "error" on this inner sequence
					Ef(/*err=*/"Boo",/*success=*/"Ignored",100,done.errfcb);
				})
				.then(function(){
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				})
				.or(function(){
					mainDone.apply(ø,arguments);
				});
			})
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "Boo"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.gate(
				function(done){
					done("Ignored");
				},
				function(done){
					Ef(/*err=*/"All done",/*success=*/"Ignored 2",100,done.errfcb);
				}
			)
			.val(function(){
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
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

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},2000);
		});
		tests.push(function(testDone){
			var label = "Core Test #22", timeout, sq, sq2, sq3, sq4, sq5;

			sq = ASQ(function(done){
				setTimeout(function(){
					done("Hello");
				},10);
			});

			// first fork-listener
			sq2 = sq.fork().val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "Hello"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			// second fork-listener
			sq3 = sq.fork().val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "Hello"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			// main sequence-listener
			sq.val(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "Hello"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			// test sending an error into the forks
			sq.then(function(done){
				setTimeout(function(){
					done.fail("World");
				},10);
			});

			// second fork-listener
			sq4 = sq.fork()
			.val(function(){
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "World"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			// third fork-listener
			sq5 = sq.fork()
			.val(function(){
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg){
				if (!(
					arguments.length === 1 &&
					msg === "World"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			});

			// main sequence listener
			sq.val(function(){
				var args = ARRAY_SLICE.call(arguments);
				args.unshift(testDone,label);
				FAIL.apply(FAIL,args);
			})
			.or(function(msg){
				var args = ARRAY_SLICE.call(arguments);

				// defer this error handling while the other
				// forks are error-notified
				setTimeout(function(){
					clearTimeout(timeout);

					if (args.length === 1 &&
						msg === "World"
					) {
						PASS(testDone,label);
					}
					else {
						args.unshift(testDone,label);
						FAIL.apply(FAIL,args);
					}
				},0);
			});

			timeout = setTimeout(function(){
				FAIL(testDone,label + " (from timeout)");
			},2000);
		});
		tests.push(function(testDone){
			var label = "Core Test #23", timeout,
				sq1, sq2, seed = 10
			;

			function seqMessages(msg1,msg2,msg3) {
				return ASQ(function(done){
					setTimeout(function(){
						done(msg1,msg2,msg3);
					},25);
				});
			}

			function promiseMessages(msg1,msg2,msg3) {
				return new Promise(function(resolve){
					setTimeout(function(){
						resolve(ASQ.messages(msg1,msg2,msg3));
					},25);
				});
			}

			sq1 = ASQ()
			.seq(seqMessages)
			.promise(promiseMessages)
			.val(function(s1,s2,s3){
				// if any messages received, use them
				seed += ((s1 + s2 + s3) || 0);
			})
			.then(asyncDelayFn(100))
			.then(function(done){
				done(++seed);
			})
			.gate(
				function(done){
					done(++seed);
				},
				function(done){
					done(++seed);
				}
			);

			// duplicate a template of the sequence
			sq2 = sq1.duplicate();

			sq1.val(function(msg1,msg2){
				if (!(
					msg1 === 12 &&
					msg2 === 13
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.then(function(){
				seed = 20;

				// unpause the duplicated sequence
				sq2 = ASQ.unpause(sq2);
				// inject some messages into the unpausing sequence
				//   hint: not a great idea, but supported
				sq2.unpause(1,2);
				sq2.unpause(3);

				// later, check to see if the sequence
				// was indeed restarted and ran properly
				setTimeout(function(){
					if (seed !== 29) {
						clearTimeout(timeout);
						var args = [testDone,label,"seed: " + seed];
						FAIL.apply(FAIL,args);
						return;
					}

					sq2.val(function(msg1,msg2){
						if (!(
							msg1 === 28 &&
							msg2 === 29
						)) {
							clearTimeout(timeout);
							var args = ARRAY_SLICE.call(arguments);
							args.unshift(testDone,label);
							FAIL.apply(FAIL,args);
						}
					})
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
				},500);
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
			var label = "Core Test #24", timeout, ASQ2, ASQ3;

			ASQ2 = ASQ.clone();

			ASQ2._hello_ = "world";
			ASQ2.extend("foobar",function(){ return function(){}; });

			ASQ3 = ASQ2.clone();

			try {
				ASQ().foobar();
				FAIL(testDone,label,"ASQ().foobar()");
				return;
			} catch (err) {}

			try {
				ASQ2().foobar();
			}
			catch (err) {
				FAIL(testDone,label,"ASQ2().foobar()",err,ASQ2(),ASQ2().foobar);
				return;
			}

			try {
				ASQ3._hello_.length;
				ASQ3().foobar();
				FAIL(testDone,label,"ASQ3",ASQ3);
				return;
			} catch (err) {}

			// testing a custom plugin which will pass along
			// any messages received to it, but will inject
			// the message "foo" at the beginning, and append
			// the message "bar" after the last
			ASQ2 = ASQ.clone();

			ASQ2.extend("foobar",function(api,internals){
				return function __foobar__() {
					api.then(function(done){
						// cheat and manually inject a message into
						// the stream
						internals("sequence_messages").push("foo");

						// pass messages the proper way
						done.apply(null,
							ARRAY_SLICE.call(arguments,1)
							.concat(["bar"])
						);
					});
					return api;
				};
			});

			ASQ2("Hello","World")
			.foobar() // a custom plugin
			.val(function(msg1,msg2,msg3,msg4){
				clearTimeout(timeout);

				if (
					arguments.length === 4 &&
					msg1 === "foo" &&
					msg2 === "Hello" &&
					msg3 === "World" &&
					msg4 === "bar"
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
			var label = "Core Test #25", timeout;

			ASQ()
			.then(function(done){
				var msgs = [];

				ASQ()
				.gate(
					function(done1){
						done1("hello");
						setTimeout(function(){
							done1("nope");
						},20);
					},
					function(done2){
						setTimeout(function(){
							done2("world");
						},40);
						setTimeout(function(){
							done2.fail("ouch");
						},60);
					}
				)
				.then(
					function(){
						var args = ARRAY_SLICE.call(arguments,1);
						msgs = msgs.concat(args);
					},
					function(){
						var args = ARRAY_SLICE.call(arguments,1);
						msgs = msgs.concat(args);
					}
				)
				.or(function(err){
					msgs.push(err);
				})

				ASQ(
					function(done1){
						done1("42");
						setTimeout(function(){
							done1("boo");
						},80);
						setTimeout(function(){
							done1.fail("oops");
						},100);
					},
					function(){
						var args = ARRAY_SLICE.call(arguments,1);
						msgs = msgs.concat(args);
					},
					function(){
						var args = ARRAY_SLICE.call(arguments,1);
						msgs = msgs.concat(args);
					}
				)
				.or(function(err){
					msgs.push(err);
				});

				setTimeout(function(){
					done.apply(ø,msgs);
				},150);
			})
			.val(function(msg1,msg2,msg3){
				if (!(
					arguments.length === 3 &&
					msg1 === "42" &&
					msg2 === "hello" &&
					msg3 === "world"
				)) {
					clearTimeout(timeout);
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}
			})
			.then(function(){
				clearTimeout(timeout);
				PASS(testDone,label);
			})
			.onerror(function(){
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
