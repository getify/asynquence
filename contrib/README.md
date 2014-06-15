# asynquence Contrib

Optional *asynquence* plugin helpers. The full bundle of plugins (`contrib.js`) is **~2.4k** minzipped.

Gate variations:

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

Sequence-step variations:

* `until(..)` is like `then(..)`, except it **keeps re-trying until success** or `break()` (for loop semantics) before the main sequence proceeds.
* `try(..)` is like `then(..)`, except it proceeds as success on the main sequence **regardless of success/failure signal**. If an error is caught, it's transposed as a special-format success message: `{ catch: ... }`.
* `waterfall(..)` is like a sequence of `then(..)`s, except the output from each step is tracked, and the aggregate of all steps' success messages thus far is the input messages to the next step (step 3 gets passed success output from both 1 and 2, etc). Thus, the final output success message(s) of `waterfall(..)` is the collection of all success messages from the waterfall's steps.

    An error anywhere along the waterfall behaves like an error in any sequence, immediately jumping to error state and aborting any further success progression.

### `failAfter` Plugin

`failAfter` plugin provides `ASQ.failAfter(..)`, which is a time-delayed version of the core `ASQ.failed(..)`. `failAfter(..)` produces a sequence that will fail after a certain period of time.

The first parameter to `failAfter(..)` is a number of milliseconds to delay the failure-completion. Any subsequent (optional) parameters passed will be the error messages for the eventually-failed sequence.

The most likely usage of this plugin is in combination with the `race(..)` plugin, to create a "timeout" type of behavior:

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
// node.js: fs.readFile wrapper
function readFile(filename) {
	// setup an empty sequence (much like an empty
	// promise)
	var sq = ASQ();

	// call node.js `fs.readFile(..), but pass in
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

`runner(..)` takes either an **iterable-sequence** or an ES6 generator function, which will be iterated through step-by-step. `runner(..)` will handle either asynquence sequences, standard promises, or immediate values as the yielded/returned values from the generator or iterable-sequence steps.

The generator/iterable-sequence will receive any value-messages from the previous sequence step (via the *control token* -- see [CSP-style Concurrency](#csp-style-concurrency) below for explanation), and the final yielded/returned value will be passed along as the success message(s) to the next main sequence step. Error(s) if any will flag the main sequence as error, with error messages passed along as expected.

Examples:

```js
function double(x) {
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
		x = yield double(x);
	}
})
.val(function(num){
	console.log(num); // 128
});
```

```js
function double(x) {
	// standard native Promise
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve(x * 2);
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
	.then(double)
	.then(double)
	.then(double)
)
.val(function(num){
	console.log(num); // 16
});
```

#### CSP-style Concurrency

`runner(..)` can accept 2 or more generators (or iterable-sequences) that you can cooperatively interleave execution of, which lets you leverage a simple form of CSP-style coroutine concurrency (aka cooperative multitasking").

Generators/iterable-sequences will receive a *control token* with a messages channel (`.messages` property is a simple array) to use for passing messages back and forth as the coroutines interleave.

If you `yield` (or `return` in the case of iterable-sequences) that *control token* back (or a sequence/promise that eventually produces it), then you will signal to transfer control to the next (round-robbin ordering style) generator/sequence in the concurrency-grouping.

Otherwise, yielding/returning of any other type of value, **including a sequence/promise**, will retain control with the current generator/iterator-step.

With both generators and iterable-sequences, the last *final* non-`undefined` value that is yielded/returned from the concurrency-grouping run will be the forward-passed message(s) to the next step in your main *asynquence* chain. If you want to pass on the channel messages from your generator run, end your last generator by `yield`ing out the `.messages` property of the *control token*. Likewise with iterable-sequences, `return` the channel messages from the last iterable-sequence step.

To get a better sense of how this advanced functionality works, check out these examples:

* [Ping Pong](http://jsbin.com/jecazequ/1) (from [js-csp](https://github.com/ubolonton/js-csp/blob/master/README.md#examples) and the [go ping-pong](http://talks.golang.org/2013/advconc.slide#6) example)
* [Two generators paired as CSP-style co-routines](https://gist.github.com/getify/10172207)

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

2. The rest of the chain sets up a normal *asynquence* sequence, which will then be repeat-executed each time the reactive trigger is fired. The reactive sequence also has an added `stop()` method, which you can use to trigger any registered teardown handlers and stop all reactive sequence handling.

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

For a more real-world type of example, see [reactive sequences + `gate()`](http://jsbin.com/rozipaki/1). Here's [another example](https://gist.github.com/getify/bba5ec0de9d6047b720e), which handles http request/response streams with reactive sequences.

## Using Contrib Plugins

In the browser, include the `contrib.js` file along with the *asynquence* library file (`asq.js`). Doing so automatically extends the API with the plugins.

In node.js, you install the `asynquence-contrib` package alongside the `asynquence` package. **Note:** The *asynquence-contrib* package will return the ASQ for you, so you technically only need to this if using both:

```js
// Note: requiring "asynquence" not strictly needed here,
// since contrib will retrieve and return it automatically

var ASQ = require("asynquence-contrib");
```

They can then be used directly, like this:

```js
ASQ()
.try(foo)
.until(bar)
.then(baz);
```

## Building Contrib Bundle

There is a utility provided to bundle the contrib plugins.

`bundle.js` builds the unminified bundle `contrib.src.js`, and then builds (minifies) `contrib.js`. The recommended way to invoke this utility is via npm:

`npm run-script bundle`

By default, the build includes all the `contrib/plugin.*` plugins. But, you can manually specify which plugins you want, by name, like this:

```
./bundle.js any none try
```

This would bundle only the `any`, `none`, and `try` plugins.

**Note:** `npm run-script ..` [doesn't *currently*](https://github.com/isaacs/npm/issues/3494) support passing the extra command line parameters, so you must use `./bundle.js` **instead of** `npm run-script bundle` if you want to pick which specific plugins to bundle.

## License

The code and all the documentation, unless otherwise noted, are released under the MIT license.

http://getify.mit-license.org/
