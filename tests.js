(function(name,context,definition){
	if (typeof module !== "undefined" && module.exports) module.exports = definition();
	else if (typeof define === "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("ASQ_tests",this,function(name,context){

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
		var tests = [];

		tests.push(function(testDone){
			var label = "Test  #1", timeout;

			ASQ()
			.then(asyncDelayFn(100))
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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test  #2", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test  #3", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test  #4", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test  #5", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test  #6", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test  #7", timeout;

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

				if (msg1[0] === "msg1" &&
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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test  #8", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test  #9", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test #10", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test #11", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test #12", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test #13", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test #14", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){

			function doSeq(msg1,msg2) {
				var seq = ASQ();

				seq
				.then(asyncDelayFn(100))
				.then(function(done){
					done(msg2);
				});

				return seq;
			}

			var label = "Test #15", timeout;

			ASQ()
			.then(function(done){
				asyncDelayFn(100)(function(){
					done("Hello","World");
				});
			})
			.seq(doSeq)
			.then(function(done,msg1){
				clearTimeout(timeout);

				if (msg1 === "World") {
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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){

			function doSeq(msg1,msg2) {
				var seq = ASQ();

				seq
				.then(asyncDelayFn(100))
				.then(function(done){
					done.fail(msg2);
				});

				return seq;
			}

			var label = "Test #16", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});
		tests.push(function(testDone){
			var label = "Test #17", timeout;

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
				FAIL(testDone,label + "(from timeout)");
			},1000);
		});

		return tests;
	}

	return defineTests;
});
