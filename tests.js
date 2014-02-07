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
			var label = "Core Test  #1", timeout;

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
			var label = "Core Test  #2", timeout;

			ASQ()
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
			},1000);
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
			},1000);
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
			},1000);
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
			},1000);
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
			var label = "Core Test  #6", timeout;

			ASQ()
			.then(asyncDelayFn(100))
			.gate(
				asyncDelayFn(800),
				asyncDelayFn(600),
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
			},1000);
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
			},1000);
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
					asyncDelayFn(200)(function(){
						done.fail("World");
					});
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
			},1000);
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
			},1000);
		});
		tests.push(function(testDone){
			var label = "Core Test #10", timeout;

			ASQ()
			.then(asyncDelayFn(100))
			.then(function(done){
				ASQ()
				.then(asyncDelayFn(100))
				.then(function(done){
					asyncDelayFn(100)(function(){
						done.fail("Hello");
					});
				})
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
			},1000);
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
			},1000);
		});
		tests.push(function(testDone){
			var label = "Core Test #12", timeout;

			ASQ()
			.then(function(done){
				done.fail("Hello");
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
			},1000);
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
			},1000);
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
			},1000);
		});
		tests.push(function(testDone){
			var label = "Core Test #15", timeout;

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
			// NOTE: calling doSeq2() to pass in ASQ instance itself
			.seq(doSeq2())
			.then(function(done,msg){
				clearTimeout(timeout);

				if (msg === "Sweet") {
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
			var label = "Core Test #16", timeout;

			function doSeq(msg1,msg2) {
				var seq = ASQ();

				seq
				.then(asyncDelayFn(250))
				// NOTE: calling doSeq2() to pass in ASQ instance itself
				.seq(doSeq2(msg2));

				return seq;
			}

			function doSeq2(msg) {
				var seq = ASQ();

				seq
				.then(asyncDelayFn(50))
				// NOTE: calling doSeq3() to pass in ASQ instance itself
				.seq(doSeq3(msg + "!"));

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
			},1000);
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
			},1000);
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
			},1000);
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
			},1000);
		});
		tests.push(function(testDone){
			var label = "Core Test #20", timeout, Q = tests.Q;

			function Pr(){
				var args = ASQ.messages.apply(ø,arguments);
				var def = Q.defer();
				setTimeout(function(){
					def.resolve(args.length > 1 ? args : args[0]);
				},50);
				return def.promise;
			}

			function bPr(){
				var args = ASQ.messages.apply(ø,arguments);
				var def = Q.defer();
				setTimeout(function(){
					def.reject(args.length > 1 ? args : args[0]);
				},50);
				return def.promise;
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
			.val(function(msg){
				if (!(
					arguments.length === 1 &&
					ASQ.isMessageWrapper(msg) &&
					msg.length === 2 &&
					msg[0] === "Hello" &&
					msg[1] === "World"
				)) {
					var args = ARRAY_SLICE.call(arguments);
					args.unshift(testDone,label);
					FAIL.apply(FAIL,args);
				}

				return msg[1].toUpperCase();
			})
			.promise(bPr) // Note: a broken promise!
			.val(function(msg1,msg2){
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
			},1000);
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
			},1000);
		});
		tests.push(function(testDone){
			var label = "Core Test #22", timeout, sq, sq2, sq3, sq4, sq5;

			sq = ASQ(function(done){
				setTimeout(function(){
					done("Hello");
				},100);
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
				},100);
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
			},1000);
		});
		tests.push(function(testDone){
			var label = "Core Test #23", timeout;

			// testing a custom plugin which will pass along
			// any messages received to it, but will inject
			// the message "foo" at the beginning, and append
			// the message "bar" after the last
			ASQ.extend("foobar",function(api,internals){
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

			ASQ("Hello","World")
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
			},1000);
		});

		return tests;
	}

	return defineTests;
});
