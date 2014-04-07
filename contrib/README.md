# asynquence Contrib

Optional plugin helpers are provided in `/contrib/*`. The full bundle of plugins (`contrib.js`) is **~1.9k** minzipped.

Gate variations:

* `all(..)` is **an alias** of `gate(..)`.
* `any(..)` is like `gate(..)`, except **just one segment** *has* to succeed to proceed on the main sequence.
* `first(..)` is like `any(..)`, except **as soon as any segment succeeds**, the main sequence proceeds (ignoring subsequent results from other segments).
* `last(..)` is like `any(..)`, except only **the latest segment to complete successfully** sends message(s) along to the main sequence.
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

### `iterable-sequence` Plugin

`iterable-sequence` plugin provides `ASQ.iterable()` for creating iterable sequences. See [Iterable Sequences](https://github.com/getify/asynquence/blob/master/README.md#iterable-sequences) for more information, and examples: [sync loop](https://gist.github.com/getify/8211148#file-ex1-sync-iteration-js) and [async loop](https://gist.github.com/getify/8211148#file-ex2-async-iteration-js).

### `errfcb` Plugin

`errfcb` plugin provides `errfcb()` on the main sequence instance API. Unlike other API methods, `errfcb()` **does not return** the main sequence instance (for chaining). Instead, it returns an "error-first" style (aka "node-style") callback that can be used with any method that expects such a callback.

If the "error-first" callback is then invoked with the first ("error") parameter set, the main sequence is flagged for error as usual. Otherwise, the main sequence proceeds as success. Messages sent to the callback are passed through to the main sequence as success/error as expected.

### `runner` Plugin

`runner(..)` takes either an **iterable-sequence** or an ES6 generator function, which will be iterated through step-by-step. `runner(..)` will handle either asynquence sequences, standard promises, or immediate values as the yielded/returned values from the generator or iterable-sequence steps.

The generator/iterable-sequence will receive any value-messages from the previous sequence step, and the final yielded/returned value will be passed along as the success message(s) to the next main sequence step. Error(s) if any will flag the main sequence as error, with error messages passed along as expected.

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
.runner(function*(x){
	while (x < 100) {
		x = yield double(x);
	}
})
.then(function(num){
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
	.then(double)
	.then(double)
	.then(double)
)
.then(function(num){
	console.log(num); // 16
});
```

### `react` Plugin

Consider this code:

```js
$("#button").click(function(evt){
   ASQ(this.id)
   .then(..)
   .seq(..)
   .then(..)
   .val(..)
});
```

Each time the button is clicked, a new sequence is defined and executed to "react" to the event. But it's a little awkward and backward that the sequence must be (re)defined each time, *inside* the event listener.

The `react` plugin provides first-class syntactic support for *asynquence* "reactive sequence" pattern, inspired by [Reactive Observables](http://rxjs.codeplex.com/). It essentially combines *asynquence*'s promise-based sequence control with repeatable event handling.

1. `react(..)` accepts a listener setup handler, which will receive a trigger (called `proceed` in the snippet below) that  event listener(s) "react" by invoking.

2. The rest of the chain after `react(..)...` sets up a templated sequence, which will then be executed each time the `proceed()` trigger is fired.

The `react` plugin simply reverses the paradigm of the previous snippet, providing a way to specify the sequence externally and once, and have it be reinvoked each time an event triggers it.

```js
ASQ.react(
   // this listener setup handler will be called only once
   function(proceed){
      // we can call `proceed(..)` (or whatever you want to call the param!)
      // every time our stream/event fires, instead of just once, like
      // normal promise triggers
      $("#button").click(function(evt){
         // fire off a new sequence for each click
         proceed(this.id);
      });
   }
)
// each time our reactive event fires, process the rest of this sequence
.then(..)
.seq(..)
.then(..)
.val(..);
```

Inside the `react(..)` listener setup function, you can set up as many listeners for any kind of events (ajax, timers, click handlers, etc) as you want, and all you need to do to fire off the sequence is call the `proceed()` (or whatever you want to name it!) callback. Whatever messages you pass to `proceed(..)` will pass along to the first step of the sequence.

## Using Contrib Plugins

In the browser, include the `contrib.js` file along with the *asynquence* library file (`asq.js`). Doing so automatically extends the API with the plugins.

In node.js, you install the `asynquence-contrib` package alongside the `asynquence` package, and `require(..)` both of them, in order:

```js
var ASQ = require("asynquence");
require("asynquence-contrib");
```

**Note:** The `asynquence-contrib` module has no API (it only attaches itself to the `asynquence` package), so just calling `require(..)` without storing its return value is sufficient and recommended.

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
