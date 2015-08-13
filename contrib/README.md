# asynquence Contrib

Optional *asynquence* plugin helpers.

## Function-wrapping Adapter

To integrate *asynquence* into standard callback-oriented code bases, sometimes it's preferable to create wrappers around commonly used callback-oriented functions, to be used in place of the original functions. The wrapper automatically constructs an *asynquence* instance when called, and wires up the underlying call to the original callback-oriented function so that it maps its output behavior to the *asynquence* instance.

For example, we can call `ASQ.wrap(..)` to wrap `fs.readFile(..)` in Node.js, suppressing the callback in its signature and turning it into an *asynquence*-returning function:

```js
var readfile = ASQ.wrap(fs.readFile);

readfile("something.txt",{ encoding: "utf8" })
.val(function(contents){
	// file contents
})
.or(function(err){
	// oops, `err` in reading file!
});
```

**Note:** `ASQ.wrap(..)` creates a function which will automatically be async in nature, even if the underlying function would normally have called its callback immediately/synchronously. **DO NOT RELY** on ordered side-effects of such wrapped functions.

Most of Node.js's standard functions expect an "error-first" style callback, and they also expect it to be at the end of the arguments list (aka "parameters first"). The default settings for `ASQ.wrap(..)` assume that sort of function signature.

However, you may need to use *asynquence* with other sorts of function signatures.

For example, some functions are the opposite in parameter order (aka "parameters last"), where the callback must be the first argument and any other parameters are passed after it. You can pass an options-object as the second parameter to `ASQ.wrap(..)` to signal alternative function signature behavior:

```js
function doSomething(cb,p1,p2) {
	// do something with `p1` and `p2`, then later
	// call `cb` as an error-first cb
}

var better = ASQ.wrap(doSomething,{ params_last: true });

better("val 1","val 2")
.val(function(result){
	// result
})
.or(function(err){
	// oops, `err` occurred!
});
```

You also may want to specify a specific `this` binding to use with the underlying function/method call. You can do such with the normal JS `.bind(..)` utility, like `ASQ.wrap( fn.bind(obj) )`, but that gives you permanent *hard-binding* that can't be overriden, which may or may not be suitable.

If you want the more flexible "soft binding" (an alternate default `this` binding -- instead of `window` / `global` -- that can still be overriden), you can specify a `this` in the options object, like so:

```js
function doSomething(cb) {
	cb(this.id);
}

var o1 = { id: 42 };
var o2 = { id: "foobar" };

var better = ASQ.wrap(doSomething,{ this: o1 });

// use `o1` as default soft-bound `this`
better()
.val(function(id){
	id; // 42
});

// `this` is still overridable
better.call(o2)
.val(function(id){
	id; // "foobar"
});
```

The complete list of options you can pass:

* `this`: (default: `{ }`) specifies a *soft-binding* (aka, alternate default) for `this` for the underlying function call being wrapped
* `params_first`: (default: `true`) signals "parameters first" style signature
* `params_last`: (default: `false`) signals "parameters last" style signature
* `errfcb`: (default: `true`) signals "error-first" style callback expected
* `splitcb`: (default: `false`) signals split success and error callbacks expected
* `simplecb`: (default: `false`) signals simple (success-only) callback expected, which assumes an error is either passed opaquely (inaccessible to *asynquence* handling) to the callback in some way (which you must handle), or an error is `throw`n to be `try..catch` caught (which *asynquence* will handle)
* `gen`: (default: `false`) signals that you've passed in a generator (ES6) to wrap (see below).

Obviously, there's several mutually exclusive combinations of these options which would be ambiguous, and are thus not allowed (will result in an immediately-thrown error upon calling `wrap(..)`), such as `errfcb: false`, `params_first: true, params_last: true`, etc. **Just avoid these.** Also, `params_first: false` is allowed, and just means `params_last: true`, but the latter is more preferable to the former.

### Wrapping A Generator

If you pass `gen:true` as an option, it overrides all other options, and instead returns back a function that creates a new *asynquence* sequence with the `runner(..)` plugin (see below) wired to run the generator you passed in. Whatever arguments you pass to the wrapper will pass into the generator (accessed via `token.messages` -- again, see `runner(..)` plugin below).

```js
var g = ASQ.wrap(function*(token){
	var x = 1;
	for (var i=0; i < token.messages.length; i++) {
		x = yield (x * token.messages[i]);
	}
},{ gen:true });

g(2,3,4)
.val(function(msg){
	console.log(msg);	// 24
});

g(2,3,4,5)
.val(function(msg){
	console.log(msg);	// 120
});
```

The wrapper can be called one or many times, and each time will create and return a new sequence to run the generator.

## Gate-step Variations

* `any(..)` is like `gate(..)`, which waits for all segments to complete, except **just one segment has to eventually succeed** to proceed on the main sequence.
* `first(..)` is like `any(..)`, except **as soon as any segment succeeds**, the main sequence proceeds (ignoring subsequent results from other segments).
* `race(..)` is like `first(..)`, except the main sequence proceeds **as soon as any segment completes** (either success or failure).
* `last(..)` is like `any(..)`, except only **the latest segment to complete successfully** sends its message(s) along to the main sequence.
* `none(..)` is the inverse of `gate(..)`: the main sequence proceeds only **if all the segments fail** (with all segment error message(s) transposed as success message(s) and vice versa).
* `map(arr, eachFn)` allows an asynchronous mapping of an array's values to another set of values. `map(..)` constructs a gate of segments, one for each item in `arr`. Each segment invokes `eachFn(..)` for the respective item in the array.

    `eachFn(item, doneTrigger, ..)` receives the respective `item` in the array and a `doneTrigger` to invoke with the new value to map back to that array position. **Note:** If multiple values are passed, that item's value will be an array (*asynquence* message wrapper) collection of the values passed.

    Just like with normal gates, `eachFn(..)` also receives any sequence messages passed forward from the previous main sequence step, such as `eachFn(item, doneTrigger, msg1, msg2, ..)`. And, if any segment causes an error, the rest of the `map(..)` fails and the main sequence is flagged as error'd.

    If either `arr`, `eachFn` or both are not passed to `map(..)`, it will attempt to pull them from the value-message stream it received from the previous step. Even if it does so, any subsequent messages in the stream will still pass on to the `eachFn` callback.

    The final success message from a `map(..)` sequence step is the newly constructed array of mapped values.

## Sequence-step Variations

* `until(..)` is like `then(..)`, except it **keeps re-trying until success** or `break()` (for loop semantics) before the main sequence proceeds.
* `try(..)` is like `then(..)`, except it proceeds as success on the main sequence **regardless of success/failure signal**. If an error is caught, it's transposed as a special-format success message: `{ catch: ... }`.
* `waterfall(..)` is like a sequence of `then(..)`s, except the output from each step is tracked, and the aggregate of all steps' success messages thus far is the input messages to the next step (step 3 gets passed success output from both 1 and 2, etc). Thus, the final output success message(s) of `waterfall(..)` is the collection of all success messages from the waterfall's steps.

    An error anywhere along the waterfall behaves like an error in any sequence, immediately jumping to error state and aborting any further success progression.

### `pThen` & `pCatch` Plugins

`pThen` plugin provides a `pThen(..)` sequence method which is a cousin to the core built-in `then(..)`, but it works instead with similar semantics/behavior to native ES6 Promises. In other words, if you prefer the way `then(..)` works with Promises over *asynquence*'s `then(..)`, just use `pThen(..)` instead. **Note:** `pThen(..)` doesn't have the extra sugar capabilities like `then(..)` does, such as being able to accept sequences as direct parameters, etc -- it does just what Promise `then(..)` does.

Also provided is `pCatch(..)` which has the same semantics as Promise `catch(..)`: it's literally the same as calling `pThen(null, ..)`.

Example:

```js
ASQ(21)
.pThen(function(msg){
	return msg * 2;
})
.pThen(function(msg){
	return ASQ(function(done){
		setTimeout(function(){
			done(msg);
		},100);
	});
})
.pThen(function(msg){
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			reject("Oops:" + msg);
		},100);
	});
})
// sequence is now in error state!
.pThen( // or .pCatch(...
	null,
	function(err) {
		return err.toUpperCase();
	}
)
// sequence no longer in error state since
// `pThen`/`pCatch` registered an error handler
// which handled the sequence error.
.pThen(
	function(msg) {
		throw msg;
	}
)
// sequence is now in error state again!
.pCatch( // or .pThen(null, ...
	function(err){
		console.log(err); // "OOPS:42"
		return "Cool";
	}
)
// sequence no longer in error state
.val(function(msg){
	console.log(msg); // "Cool"
})
.or(function(){}); // never called
```

You'll notice differences from the *asynquence* core `then(..)`, and how they match Promise `then(..)` behaviors instead:

1. `pThen(..)` takes a `success` and/or `failure` handler (both optional), rather than multiple `then` handlers.
2. The `success` handler is not provided the `done` trigger.
3. Instead, you return either an immediate value (which then passes on to the next step at the next cycle), or a sequence or promise for a value, in which case the sequence/promise is "unwrapped", and procession occurs only after it resolves.
4. If you register a `failure` handler via `pThen(..)` or `pCatch(..)`, then it swallows (so you can handle) any sequence errors to that point, and essentially resets the sequence back to success state after it is passes.
5. You can also return a value from a `failure` handler, which is the success message passed onto the next step. **Note:** Just like with Promises, a sequence/promise returned from an `failure` handler **is not "unwrapped"** -- it's just passed along as a normal value.

### `after` & `failAfter` Plugins

`after` plugin provides a sequence instance method `after(..)` which inserts a delay into a sequence at that step. The first parameter is a number of milliseconds to wait. (Optional) additional parameters provide sequence messages to pass along (overriding previous sequence messages). Otherwise, previous sequence messages pass-through the delay automatically.

`after` plugin also provides a static method version `ASQ.after(..)` which is the same as `ASQ().after(..)`.


```js
ASQ(42) // `42` gets discarded
.after(500,"Hello","World!")
.val(function(msg1,msg2){
	console.log(msg1,msg2); // "Hello"  "World!"
});

ASQ.after(500)
.val(function(){
	console.log("Hello World!");
});
```

`failAfter` plugin provides both the sequence method `failAfter(..)` and the static method `ASQ.failAfter(..)`, which work exactly like the `after` plugin methods above, but result in failure rather than success.

The most common usage of the `failAfter` plugin is likely in combination with the `race(..)` plugin, to create "timeout" behavior:

```js
// make a 2 sec timeout for some action
ASQ()
.race(
	doSomethingAsync(..),
	ASQ.failAfter(2000,"Timeout!")
)
.val(function(){
	// success!
})
.or(function(err){
	err; // "Timeout!"
});
```

### `iterable-sequence` Plugin

`iterable-sequence` plugin provides `ASQ.iterable()` for creating iterable sequences. See [Iterable Sequences](https://github.com/getify/asynquence/blob/master/README.md#iterable-sequences) for more information, and examples: [sync loop](https://gist.github.com/getify/8211148#file-ex1-sync-iteration-js) and [async loop](https://gist.github.com/getify/8211148#file-ex2-async-iteration-js).

### `toPromise` Plugin

`toPromise` plugin provides `.toPromise()` (takes zero parameters) on a *asynquence* sequence instance's API, which allows you to vend/fork a new **native `Promise`** that's chained off of your sequence. Use this plugin if you need to send an *asynquence* sequence instance into some other utility which requires a *thenable* or standard [Promises/A+ compliant](http://promisesaplus.com) promise.

**Note:** The vended promise is forked off the sequence, leaving the original sequence intact, to be continuable as normal. The message(s) (both success and error) from the chain are passed along to the promise, but they are *also* retained in the sequence itself, as if the forked-off promise is ignored.

Example:

```js
// make an asynquence sequence to use
var sq = ASQ(function(done){
	setTimeout(function(){
		done(42); // send 42 along as success message
	},100);
});

// fork and deal with the native promise
sq.toPromise()
.then(
	// success
	function(msg){
		console.log(msg); // 42
	},
	// error
	function(err){
		console.log(err);
	}
);

// also continue with the original sequence
sq
.val(function(msg){
	console.log(msg); // 42
});
```

The goal of *asynquence* is to provide everything you need for promises-based async flow control without you needing to expose and use native promises or other promise libraries/utilities. Theoretically, this plugin should only be used when *asynquence* is insufficient in some way. If you find yourself needing to regularly vend native promises from *asynquence*, perhaps *asynquence* needs to be extended to handle that use-case, so let us know!

-----

If you're using *asynquence* in an older environment which doesn't have the native ES6 `Promise` built-in, but you still want to be able to use the `.toPromise()` utility, you need a `Promise` polyfill. There are plenty of choices out there, but a great one to consider is:

[Native Promise Only](http://github.com/getify/native-promise-only)

As long as either the native `Promise` is there, or that global has been spec-compliant polyfilled, this `toPromise` plugin can create promises off your *asynquence* sequences.

-----

### `errfcb` Plugin

`errfcb` plugin provides `errfcb()` on the main sequence instance API. Calling `errfcb()` returns an "error-first" style (aka "node-style") callback that can be used with any method that expects such a callback.

If the "error-first" callback is then invoked with the first ("error") parameter set, the main sequence is flagged for error as usual. Otherwise, the main sequence proceeds as success. Messages sent to the callback are passed through to the main sequence as success/error as expected.

Example:

```js
// Node.js: fs.readFile(..) wrapper
function readFile(filename) {
	// setup an empty sequence (much like an empty
	// promise)
	var sq = ASQ();

	// call Node.js' `fs.readFile(..), but pass in
	// an error-first callback that is automatically
	// wired into a sequence
	fs.readFile( filename, sq.errfcb() );

	// now, return our sequence/promise
	return sq;
}

readFile("meaningoflife.txt")
.then(..)
..
```

### `runner` Plugin

`runner(..)` takes either an **iterable-sequence** or an ES6 generator function, which will be iterated through step-by-step. `runner(..)` will handle either *asynquence* sequences, standard promises/thenables, thunks (see ["thunks" here](http://zef.me/6096/callback-free-harmonious-node-js)), or immediate values as the yielded/returned values from the generator or iterable-sequence steps.

The generator/iterable-sequence will receive any value-messages from the previous sequence step (via the *control token* -- see [CSP-style Concurrency](#csp-style-concurrency) below for explanation), and the final yielded/returned value will be passed along as the success message(s) to the next main sequence step. Error(s) if any will flag the main sequence as error, with error messages passed along as expected.

Using generators:

```js
function thunkDouble(x) {
	return function thunk(cb) {
		setTimeout(function(){
			// cb is an error-first style callback
			cb(null,x * 2);
		},500);
	};
}

function promiseDouble(x) {
	// using ES6 `Promise`s
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve(x * 2);
		},500);
	});
}

function seqDouble(x) {
	return ASQ(function(done){
		setTimeout(function(){
			done(x * 2);
		},500);
	});
}

ASQ(2)
.runner(function*(token){
	// extract message from control-token so
	// we can operate on it
	var x = token.messages[0];

	while (x < 100) {
		if (x < 10) {
			x = yield thunkDouble(x);
		}
		else if (x < 40) {
			x = yield promiseDouble(x);
		}
		else {
			x = yield seqDouble(x);
		}
	}
})
.val(function(num){
	console.log(num); // 128
});
```

Using iterable-sequences:

```js
function thunkDouble(x) {
	return function thunk(cb) {
		setTimeout(function(){
			// cb is an error-first style callback
			cb(null,x * 2);
		},500);
	};
}

function promiseDouble(x) {
	// using ES6 `Promise`s
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve(x * 2);
		},500);
	});
}

function seqDouble(x) {
	return ASQ(function(done){
		setTimeout(function(){
			done(x * 2);
		},500);
	});
}

ASQ(2)
.runner(
	ASQ.iterable()
	.then(function(token){
		// extract message from control-token so
		// we can operate on it
		return token.messages[0];
	})
	.then(thunkDouble)
	.then(promiseDouble)
	.then(seqDouble)
)
.val(function(num){
	console.log(num); // 16
});
```

#### CSP-style Concurrency

`runner(..)` can accept 2 or more generators (or iterable-sequences) that you can cooperatively interleave execution of, which lets you leverage a simple form of CSP-style coroutine concurrency (aka **"cooperative multitasking"**).

Generators/iterable-sequences will receive a *control token* with a messages channel (`.messages` property is a simple array) to use for passing messages back and forth as the coroutines interleave.

If you `yield` (or `return` in the case of iterable-sequences) that *control token* back (or a sequence/promise that eventually produces it), then you will signal to transfer control to the next (round-robbin ordering style) generator/sequence in the concurrency-grouping.

Otherwise, yielding/returning of any other type of value, **including a sequence/promise**, will retain control with the current generator/iterator-step.

You can also call `.add(..)` on the *control token* to add one or more generators/iterable-sequences to the concurrency-grouping:

```js
// promise to double `v` in 1000 ms
function double(v) {
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve(v * 2);
		},1000);
	});
}

function makeGen(x,y) {
	return function*(token){
		token.messages.push( yield double(x) );
		yield token;
		token.messages.push( yield double(y) );
	};
}

ASQ()
.runner(
	function*(token) {
		token.add(
			makeGen(10,20),
			makeGen(100,200)
		);
		while (token.messages.length < 4) {
			yield token;
		}
		yield token.messages;
	}
)
.val(function(msg){
	console.log(msg); // [ 20, 200, 40, 400 ]
});
```

With both generators and iterable-sequences, the last *final* non-`undefined` value that is yielded/returned from the concurrency-grouping run will be the forward-passed message(s) to the next step in your main *asynquence* chain.

If you want to pass on the channel messages from your generator run, end your last generator by `yield`ing out the `.messages` property of the *control token* (see above snippet). Likewise with iterable-sequences, `return` the channel messages from the last iterable-sequence step.

To get a better sense of how this advanced functionality works, check out these examples:

* [State Machine](http://jsbin.com/luron/1/edit?js,console) with simple generator co-routines (hidden CSP)
* [Ping Pong](http://jsbin.com/qutabu/1/edit?js,output) (from [js-csp](https://github.com/ubolonton/js-csp/blob/master/README.md#examples) and the [go ping-pong](http://talks.golang.org/2013/advconc.slide#6) example)
* [Two generators paired as CSP-style co-routines](https://gist.github.com/getify/10172207)

#### go-Style CSP API Emulation

If you've heard of go-style CSP concurrency, such as in [Clojure's core.async](https://clojure.github.io/core.async/), or in various JS ports such as [@jlongster](http://github.com/jlongster)'s [js-csp fork](https://github.com/jlongster/js-csp) (also, [read his blog post](http://jlongster.com/Taming-the-Asynchronous-Beast-with-CSP-in-JavaScript)) of [ubolonton's js-csp](https://github.com/ubolonton/js-csp), *asynquence* has a (nearly-identical) API emulation layer that you can drop on top of *asynquence*'s CSP-flavored `runner(..)` mechanism described above to express channel-based concurrency.

For example:

```js
ASQ()
.runner(
	ASQ.csp.go(function*(ch){
		console.log("sending value");
		yield ASQ.csp.put(ch,42);
		console.log("send complete");
	}),
	ASQ.csp.go(function*(ch){
		console.log("waiting...");
		yield ASQ.csp.take( ASQ.csp.timeout(1000) );
		console.log(
			"received value:",
			yield ASQ.csp.take(ch)
		);
	})
)
.val(function(){
	console.log("all done");
});

// sending value
// waiting...
// received value: 42
// send complete
// all done
```

As you can see, by calling `yield ASQ.csp.put(..)`, you're blocking that coroutine (aka "goroutine") while it attempts to send the value on the channel. The other coroutine doesn't take the value right away (it waits 1000ms). Then `yield ASQ.csp.take(..)` blocks until a value can be taken from the channel.

In this case, `42` is already waiting to be sent, but if there were no value yet, that coroutine would block and wait. Once the value is taken and the second coroutine finishes, the first coroutine is unblocked and it finishes as well.

The main concept with go-style CSP -- channel-based concurrency -- is that you use `put(..)`s and `take(..)`s on a shared channel (like a message stream) to coordinate interactions across multiple coroutines -- implicit transfers of control. Both `put(..)` and `take(..)` block, so that regardless of which action is taken "first", both must pair before the message can be sent across the channel.

To use the go-style API emulation layer, you'll need (at least) the `iterable()` and `pThen()`/`pCatch()` contrib plugins.

In the browser:
```html
<script src="asq.js"></script>
<script src="contrib.js"></script>
<script src="asq-go-csp.js"></script>
```

In node:
```js
var ASQ = require("asynquence");

require("asynquence-contrib");
require("asynquence-contrib/asq-go-csp.js");
```

go-style CSP can be a very powerful abstraction for certain concurrency tasks, so using this API emulation layer gives you even more choices for expressing and managing async flow control in your JS programs.

Check out [several more examples of go-style CSP](https://gist.github.com/getify/e0d04f1f5aa24b1947ae).

### `react` Plugin

Consider this kind of ugly code:

```js
$("#button").click(function(evt){
   ASQ(this.id)
   .then(..)
   .seq(..)
   .then(..)
   .val(..)
});
```

Each time the button is clicked, a new sequence is defined and executed to "react" to the event. But it's a little awkward and ugly that the sequence must be (re)defined each time, *inside* the event listener.

The `react` plugin separates the capabilities of listening for events and of responding to them, providing first-class syntactic support for the *asynquence* "reactive sequence" pattern, inspired by [RxJS Reactive Observables](http://rxjs.codeplex.com/). It essentially combines *asynquence*'s flow-control with repeatable event handling.

1. `react(..)` accepts a listener setup handler, which will receive a reactive trigger (called `proceed` in the snippet below) that event listener(s) "react" with by invoking. It will also receive a function you can call one or more times to register a *teardown* handler (to unbind event handlers, etc).
2. The rest of the chain sets up a (mostly) normal *asynquence* sequence, which will then be repeat-executed each time the reactive trigger is fired. The reactive sequence also has an added `stop()` method, which you can use to trigger any registered teardown handlers and stop all reactive sequence handling.
	- **Note:** The following sequence methods and plugins should *not* be used on a reactive sequence, as such behavior will be undefined and/or unpredictable: `pipe(..)`, `fork(..)`, `errfcb(..)`, `pThen(..)`/`pCatch(..)`, and `toPromise(..)`.

The `react` plugin reverses the paradigm of the first snippet, providing a way to specify the sequence externally and once, and have it be re-triggered each time an event fires.

```js
var rsq = ASQ.react(
   // this listener setup handler will be called only once
   function setup(proceed,registerTeardownHandler){
      // fire off a new sequence for each click
      function handler(evt) {
         // we can call `proceed(..)` (or whatever you want
         // to call the param!) every time our stream/event
         // fires, instead of just once like normal promise
         // resolution
         proceed(this.id);
      }

      $("#button").click(handler);

      // register a handler to be called when tearing down
      // the reactive sequence handling
      registerTeardownHandler(function(){
         $("#button").unbind("click",handler);
      });

      // inside our `setup` handler, `this` will point to
      // the reactive sequence, which has a `stop()` method
      // that tears down the reactive sequence handling
      EVTHUB.on("finish",this.stop);
   }
)
// each time our reactive event fires,
// process the rest of this sequence
.then(..)
.seq(..)
.then(..)
.val(..);

// later, to stop the reactive sequence handling:
EVTHUB.on("totally-done",rsq.stop);
```

Inside the `react(..)` listener setup function, you can set up as many listeners for any kind of events (ajax, timers, click handlers, etc) as you want, and for each, all you need to do to fire off the sequence is call the `proceed(..)` (or whatever you want to name it!) callback. Whatever messages you pass to `proceed(..)` will pass along to the first step of the sequence instance.

The `proceed` function has two helpers on it for dealing with streams (particularly node streams): `proceed.onStream(..)` and `proceed.unStream(..)`. `onStream(..)` takes one or more streams and subscribes the `data` and `error` events to call the `proceed` function. `unStream(..)` takes one or more streams to unsubscribe, so you would likely use it in a registered teardown handler. For example:

```js
var rsq = ASQ.react(function(proceed,registerTeardownHandler){
	proceed.onStream( mydatastream );

	registerTeardownHandler(function(){
		proceed.unStream( mydatastream );
	});
})
.val(function(v){
	if (v instanceof Error) throw v;
	// ..
})
// ..
.or(function(err){
	console.log(err);
});
```

For a more real-world type of example, see [reactive sequences + `gate()`](http://jsbin.com/rozipaki/6/edit?js,output). Here's [another example](https://gist.github.com/getify/bba5ec0de9d6047b720e), which handles http request/response streams with reactive sequences.

#### `react` Helpers

The `reactHelpers` plugin includes several very useful helpers for the `react(..)` utility.

Some utilities for interoperating between asynquence reactive sequences and RxJS Observables:

* `toObservable(..)` sequence method on a normal asynquence sequence, or a reactive sequence, which produces an RxJS Observable (requires RxJS to be present)
* `ASQ.react.fromObservable(..)` static utility that receives an RxJS Observable and turns it into a reactive sequence as if produced by `react(..)` (requires RxJS to be present)

Some utilities for combining (aka composing) multiple reactive sequences (in much the same way you can with Observables):

* `ASQ.react.all(..)` (alias: `ASQ.react.zip(..)`) works similar to RxJS `zip(..)`. Produces a new reactive sequence (as if created by `react(..)`) that listens to one or more reactive sequences, and fires an event (with all messages) whenever *all* observed sequences have fired an event. Each sequence's stream of event messages are buffered in case the sequences are producing at different frequencies.
* `ASQ.react.latest(..)` (alias: `ASQ.react.combine(..)`) works similar to RxJS `combine(..)`. The same as `ASQ.react.all(..)`, except no buffering is done -- only the *latest* message from each sequence is kept.
* `ASQ.react.any(..)` (alias: `ASQ.react.merge(..)`) works similar to RxJS `merge(..)`. Produces a new reactive sequence (as if created by `react(..)`) that listens to one or more reactive sequences, and fires (with just one message) as soon as *any* observed sequence fires an event.
* `ASQ.react.distinct(..)` works similar to RxJS `distinct(..)`. Produces a new reactive sequence (as if created by `react(..)`) that listens to a reactive sequence, and only fires whenever a *distinct* event message comes through from the observed sequence events.

Because of how `ASQ.react.all(..)` and `ASQ.react.any(..)` operate, you can effectively *duplicate* a reactive sequence simply by passing only it to either of the utilities.

A great way to visualize how these different reactive sequence compositions work is [RxMarbles](http://rxmarbles.com/).

## Using Contrib Plugins

In the browser, include the `contrib.js` file along with the *asynquence* library file (`asq.js`). Doing so automatically extends the API with the plugins.

In Node.js, you install the `asynquence-contrib` package alongside the `asynquence` package. **Note:** The *asynquence-contrib* package will return the *asynquence* instance for you, so you technically only need this if using both:

```js
// Note: requiring "asynquence" not strictly needed here,
// since contrib will retrieve and return it automatically

var ASQ = require("asynquence-contrib");
```

They can then be used together directly, like this:

```js
ASQ()
.try(foo)
.until(bar)
.then(baz);
```

**Note:** If you load contrib bundle(s) that cannot find a peer *asynquence* top-level package to load and use, a dependency-injection function is instead returned, which expects to be called with either an *asynquence* instance, or a relative path specifying where to load it.

## Building Contrib Bundle

There is a utility provided to bundle the contrib plugins.

```
bundle.js usage:
  bundle.js [ {OPTION} .. ] [ {PLUGIN-NAME} .. ]

--help                    prints this help
--wrapper=filename        wrapper filename ("contrib-wrapper.js")
--bundle=filename         bundle filename ("contrib.src.js")
--min-bundle=filename     minified-bundle filename ("contrib.js")
--exclude={PLUGIN-NAME}   exclude a plugin from bundling

If you don't pass any {PLUGIN-NAME} parameters, all available plugins
(except any that are --exclude omitted) will be bundled.

If you pass one or more {PLUGIN-NAME} parameters, only the ones
specified (except any that are --exclude omitted) will be bundled.
```

`bundle.js` by default builds the unminified bundle `contrib.src.js`, and then builds (minifies) `contrib.js`. By default, this build includes all the `contrib/plugin.*.js` plugins.

The recommended way to invoke this utility is via npm:

```
npm run build
```

Some plugins, like `goCSP`, use ES6 features that are transpiled to ES5 using [Babel](http://babeljs.io) for the `contrib.src.js` and `contrib.js` bundles. So, to use `goCSP` in a browser for example, you'll need to also load the Babel browser polyfill, which is available at `./node_modules/babel-core/browser-polyfill.min.js` (and use `polyfill.js` in Node).

The npm package distribution also includes `contrib-es6.src.js`, which is the unminified and non-transpiled (original native ES6 code) bundle. Also included in the package is `contrib-common.js` (and `contrib-common.src.js`), which include only these commonly used plugins: `iterable`, `race`, `runner`, `toPromise`, and `wrap`.

You can build your own bundle and manually specify which plugins you want, by name. For example, to bundle only the `any`, `none`, and `try` plugins:

```
./bundle.js any none try
```

By passing *option* parameters to the bundle script, you can override the default filenames used for the contrib plugin wrapper (`--wrapper=..`), bundle (`--bundle=..`), and minified-bundle (`--min-bundle=..`). These options are useful for creating multiple variations of the plugin bundle.

## License

The code and all the documentation, unless otherwise noted, are released under the MIT license.

http://getify.mit-license.org/
