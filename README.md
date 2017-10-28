# asynquence

[![CDNJS](https://img.shields.io/cdnjs/v/asynquence.svg)](https://cdnjs.com/libraries/asynquence)

Promise-style async sequence flow control.

## Explanation

*asynquence* ("async" + "sequence") is an abstraction on top of promises (promise chains) that lets you express flow control steps with callbacks, promises, or generators.

-----

If you're interested in detailed discussion about *asynquence*, here's some reading to check out:

* ["You Don't Know JS: Async & Performance", Appendix A](https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/apA.md#appendix-a-asynquence-library) and [Appendix B](https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/apB.md#appendix-b-advanced-async-patterns).
* [Two-part](http://davidwalsh.name/asynquence-part-1) blog [post series](http://davidwalsh.name/asynquence-part-2) on [David Walsh](http://twitter.com/davidwalshblog)'s site.

-----

### TL;DR: By Example

* [Sequences & gates](https://gist.github.com/getify/5959149), at a glance
* Refactoring ["callback hell"-style to asynquence](https://gist.github.com/getify/8459026#file-gistfile3-js-L27-L39)
* Example/explanation of [promise-style sequences](https://gist.github.com/jakearchibald/0e652d95c07442f205ce#comment-977119)
* More advanced example of ["nested" composition of sequences](https://gist.github.com/getify/10273f3de07dda27ebce)
* [Iterable sequences](#iterable-sequences): [sync loop](https://gist.github.com/getify/8211148#file-ex1-sync-iteration-js) and [async loop](https://gist.github.com/getify/8211148#file-ex2-async-iteration-js) and [async batch iteration of list](https://gist.github.com/getify/8464917)
* ["State Machine" with generator coroutines](http://jsbin.com/luron/1/edit?js,console)
* ["Ping Pong", CSP-flavored](http://jsbin.com/qutabu/1/edit?js,output) coroutine concurrency, via [`runner(..)` contrib plugin](https://github.com/getify/asynquence/blob/master/contrib/README.md#runner-plugin). Also [another example](https://gist.github.com/getify/10172207) showing message passing.
* [go-Style CSP](https://gist.github.com/getify/e0d04f1f5aa24b1947ae) emulating goroutines with generator wrappers (via [`runner(..)` contrib plugin](https://github.com/getify/asynquence/blob/master/contrib/README.md#runner-plugin) and [CSP emulation adapter](https://github.com/getify/asynquence/blob/master/contrib/README.md#go-style-csp-api-emulation)).
* Event-Reactive Sequences ([example 1](http://jsbin.com/rozipaki/6/edit?js,output), [example 2](https://gist.github.com/getify/bba5ec0de9d6047b720e)) (via [`react(..)` plugin](https://github.com/getify/asynquence/blob/master/contrib/README.md#react-plugin)) inspired by [RxJS's Reactive Observables](http://rxjs.codeplex.com/)
* API [Usage Examples](#usage-examples)

### Sequences

Say you want to perform two or more asynchronous tasks one after the other (like animation delays, XHR calls, file I/O, etc). You need to set up an ordered series of tasks and make sure the previous one finishes before the next one is processed. You need a **sequence**.

You create a sequence by calling `ASQ(...)`. **Each time you call `ASQ()`, you create a new, separate sequence.**

To create a new step, simply call `then(...)` with a function. That function will be executed when that step is ready to be processed, and it will be passed as its first parameter the completion trigger. Subsequent parameters, if any, will be any messages passsed on from the immediately previous step.

The completion trigger that your step function(s) receive can be called directly to indicate success, or you can add the `fail` flag (see examples below) to indicate failure of that step. In either case, you can pass one or more messages onto the next step (or the next failure handler) by simply adding them as parameters to the call.

Example:

```js
ASQ(21)
.then(function(done,msg){
    setTimeout(function(){
        done(msg * 2);
    },10);
})
.then(function(done,msg){
    done("Meaning of life: " + msg);
})
.then(function(done,msg){
   msg; // "Meaning of life: 42"
});
```

**Note:** `then(..)` can also receive other *asynquence* sequence instances directly, just as `seq(..)` can (see below). When you call `then(Sq)`, the `Sq` sequence is tapped immediately, but the success/error message streams of `Sq` will be unaffected, meaning `Sq` can be continued separately.

If you register a step using `then(...)` on a sequence which is already currently complete, that step will be processed at the next opportunity. Otherwise, calls to `then(...)` will be queued up until that step is ready for processing.

You can register multiple steps, and multiple failure handlers. However, messages from a previous step (success or failure completion) will only be passed to the immediately next registered step (or the next failure handler). If you want to propagate along a message through multiple steps, you must do so yourself by making sure you re-pass the received message at each step completion.

To listen for any step failing, call `or(...)` (or alias `onerror(..)`) on your sequence to register a failure callback. You can call `or()` / `onerror(..)` as many times as you would like. If you call it on a sequence that has already been flagged as failed, the callback you specify will just be executed at the next opportunity.

```js
ASQ(function(done){
    done.fail("Failed!");
})
// could use `or(..)` or `onerror(..)` here
.or(function(err){
    console.log(err); // Failed!
});
```

### Gates

If you have two or more tasks to perform at the same time, but want to wait for them all to complete before moving on, you need a **gate**.

Calling `gate(..)` (or alias `all(..)` if you're from the Promises camp) with two or more functions creates a step that is a parallel gate across those functions, such that the single step in question isn't complete until all segments of the parallel gate are **successfully** complete.

For parallel gate steps, each segment of that gate will receive a copy of the message(s) passed from the previous step. Also, all messages from the segments of this gate will be passed along to the next step (or the next failure handler, in the case of a gate segment indicating a failure).

Example:

```js
ASQ("message")
.all( // or `.gate(..)`
    function(done,msg){
        setTimeout(function(){
            done(msg + " 1");
        },200);
    },
    function(done,msg){
        setTimeout(function(){
            done(msg + " 2");
        },10);
    }
)
.val(function(msg1,msg2){
    msg1; // "message 1"
    msg2; // "message 2"
});
```

`all(..)` (or `gate(..)`) can also receive (instead of a function to act as a segment) just a regular *asynquence* sequence instance as a gate segment. When you call `all(Sq)`, the `Sq` sequence is tapped immediately, but the success/error message streams of `Sq` will be unaffected, meaning `Sq` can be continued separately.

### Handling Failures & Errors

Whenever a sequence goes into the error state, any error handlers on that sequence (or any sequence that it's been `pipe()`d to -- see [Conveniences](#conveniences) below) registered with `or(..)` will be fired. Even registering `or(..)` handlers after a sequence is already in the error state will also queue them to be fired (async, on the next event loop turn).

Errors can be programmatic failures (see above) or they can be uncaught JS errors such as `ReferenceError` or `TypeError`:

```js
ASQ(function(done){
    foo();
})
.or(function(err){
    console.log(err); // ReferenceError: foo is not defined
});
```

In general, you should always register an error handler on a sequence, so as to catch any failures or errors gracefully. If there's no handlers registered when an error or failure is encountered, the default behavior of the sequence is to `throw` a global error (unfortunately not catchable with `try..catch`).

```js
ASQ(function(done){
    foo();
});

// (global) Uncaught ReferenceError: foo is not defined
```

However, there will be plenty of cases where you construct a sequence and fully intend to register a handler at a later time, or wire it into another sequence (using `pipe()` or `seq()`-- see [Conveniences](#conveniences) below), and these sequences might be intended to latently hold an error without noisily reporting it until that later time.

In those cases, where you know what you're doing, you can opt-out of the globally thrown error condition just described by calling `defer()` on the sequence:

```js
var failedSeq = ASQ(function(done){
    done.fail("Failed!");
})
// opt-out of global error reporting for
// this sequence!
.defer();

// later
ASQ(..)
.seq(failedSeq)
.or(function(err){
   console.log(err); // Failed!
});
```

Don't `defer()` a sequence's global error reporting unless you know what you're doing and that you'll definitely have its error stream wired into another sequence at some point. Otherwise, you'll miss errors that will be silently swallowed, and that makes everyone sad.

### Conveniences

There are a few convenience methods on the API, as well:

* `pipe(..)` takes one or more completion triggers from other sequences, treating each one as a separate step in the sequence in question. These completion triggers will, in turn, be piped both the success and failure streams from the sequence.

    `Sq.pipe(done)` is sugar short-hand for `Sq.then(done).or(done.fail)`.

* `seq(..)` takes one or more functions, treating each one as a separate step in the sequence in question. These functions are expected to return new sequences, from which, in turn, both the success and failure streams will be piped back to the sequence in question.

    `seq(Fn)` is sugar short-hand for `then(function(done){ Fn.apply(null,[].slice.call(arguments,1)).pipe(done); })`.

    This method will also accept *asynquence* sequence instances directly. `seq(Sq)` is (sort-of) sugar short-hand for `then(function(done){ Sq.pipe(done); })`. **Note:** the `Sq` sequence is tapped immediately, but the success/error message streams of `Sq` will be unaffected, meaning `Sq` can be continued separately.

    Additionally, this method can accept, either directly or through function-call, an [Iterable Sequence](#iterable-sequences). `seq(iSq)` is (sort-of) sugar short-hand for `then(function(done){ iSq.then(done).or(done.fail); })`.

* `val(..)` takes one or more functions, treating each one as a separate step in the sequence in question. These functions can each optionally return a value, each value of which will, in turn, be passed as the completion value for that sequence step.

    `val(Fn)` is sugar short-hand for `then(function(done){ done(Fn.apply(null,[].slice.call(arguments,1))); })`.

    This method will also accept non-function values as sequence value-messages. `val(Va)` is sugar short-hand for `then(function(done){ done(Va); })`.

* `promise(..)` takes one or more [standard Promises/A+ compliant](http://promisesaplus.com/) promises, and subsumes them into the sequence. See [Promises/A+ Compliance](#promisesa-compliance) below for more information.

    `promise(Pr)` is sugar short-hand for `then(function(done){ Pr.then(done,done.fail); })`.

    This method will also accept function(s) which return promises. `promise(Fn)` is sugar short-hand for `then(function(done){ Fn.apply(null,[].slice.call(arguments,1)).then(done,done.fail); })`.

* `fork()` creates a new sequence that forks off of the main sequence. Success or Error message(s) stream along to the forked sequence as expected, but the main sequence continues as its own sequence beyond the fork point, and neither sequence will have any further effect on the other.

    This API method is primarily useful to create multiple "listeners" at the same point of a sequence. For example: `Sq = ASQ()...; Sq2 = Sq.fork().then(..); Sq3 = Sq.fork().then(..); Sq.then(..)`. In that snippet, there'd be 3 `then(..)` listeners that would be equally and simultaneously triggered when the main `Sq` sequence reached that point.

    **Note:** Unlike most other API methods, `fork()` returns a new sequence instance, so chaining after `fork()` would not be chaining off of the main sequence but off the forked sequence.

    `Sq.fork()` is (sort-of) sugar short-hand for `ASQ().seq(Sq)`.

* `duplicate()` creates a separate copy of the current sequence (as it is at that moment). The duplicated sequence is "paused", meaning it won't automatically run, even if the original sequence is already running.

    To unpause the paused sequence-copy, call `unpause()` on it. The other option is to call the helper `ASQ.unpause(..)` and pass in a sequence. If the sequence is paused, it will be unpaused (and if not, just passes through safely).

    **Note:** Technically, `unpause()` schedules the sequence to be unpaused as the next "tick", so it doesn't really unpause *immediately* (synchronously). This is consistent with all other calls to the API (`ASQ()`, `then()`, `gate()`, etc), which all schedule procession of the sequence on the next "tick".

    The instance form of `unpause(..)` (not `ASQ.unpause(..)`) will accept any arguments sent to it and pass them along as messages to the first step of the sequence, each time it's invoked. This allows you to setup different templated (duplicated) sequences with distinct initial message states, if necessary.

    `unpause()` is only present on a sequence API in this initial paused state after it was duplicated from another sequence. It is removed as soon as that next "tick" actually unpauses the sequence. It is safe to call multiple times until that next "tick", though that's not recommended. The `ASQ.unpause(..)` helper is always present, and it first checks for an `unpause()` on the specified sequence instance before calling it, so that's safer.

* `errfcb` is a flag on the triggers that are passed into `then(..)` steps and `gate(..)` segments. If you're using methods which expect an "error-first" style (aka, "node-style") callback, `{trigger}.errfcb` provides a properly formatted callback for the occasion.

    If the "error-first" callback is then invoked with the first ("error") parameter set, the main sequence is flagged for error as usual. Otherwise, the main sequence proceeds as success. Messages sent to the callback are passed through to the main sequence as success/error as expected.

    `ASQ(function(done){ somethingAsync(done.errfcb); })` is sugar short-hand for `ASQ(function(done){ somethingAsync(function(err){ if (err) done.fail(err); else done.apply(null,[].slice.call(arguments,1))}); })`.

You can also `abort()` a sequence at any time, which will prevent any further actions from occurring on that sequence (all callbacks will be ignored). The call to `abort()` can happen on the sequence API itself, or using the `abort` flag on a completion trigger in any step (see example below).

#### API Static Functions

`ASQ.failed(..)` produces a sequence which is already in the failed state. If you pass messages along to `failed(..)`, they will be the error messages for the sequence.

`ASQ.messages(..)` wraps a set of values as a ASQ-branded array, making it easier to pass multiple messages at once, and also to make it easier to distinguish a normal array (a value) from a value-messages container array, using `ASQ.isMessageWrapper(..)`.

If you want to test if any arbitrary object is an *asynquence* sequence instance, use `ASQ.isSequence(..)`.

`ASQ.iterable(..)` is added by the `iterable-sequence` contrib plugin. See [Iterable Sequences](#iterable-sequences) below for more information.

`ASQ.unpause(..)` is a helper for dealing with "paused" (aka, *just* duplicated) sequences (see `duplicate()` above).

`ASQ.noConflict()` rolls back the global `ASQ` identifier and returns the current API instance to you. This can be used to keep your global namespace clean, or it can be used to have multiple simultaneous libraries (including separate versions/copies of *asynquence*!) in the same program without conflicts over the `ASQ` global identifier.

`ASQ.clone()` creates a fresh, clean copy of *asynquence*. This is primarily useful if you want to have different *asynquence* copies which are each extended with different plugins (see below).

**Note:** In node.js, if you load contrib bundle(s) from the standard top-level package location (`./node_modules/asynquence-contrib/a-bundle-file.js`), it will automatically look for and load (if found) the peer *asynquence* top-level package (`./node_modules/asynquence/`) and return it. So as a shortcut, you could simply do: `var ASQ = require("asynquence-contrib")` instead of loading both packages separately.

However, if you load contrib bundle(s) that cannot find a peer *asynquence* top-level package to load and use, a dependency-injection function is instead returned, which expects to be called with either an *asynquence* instance, or a relative path specifying where to load it.

In node, we can use the npm package `freshy` to let us reload the *asynquence* package to get a fresh copy of it, for each bundle to attach to:

```js
var ASQ1 = require("./path/to/bundle1.js");

require("freshy").unload("asynquence");

var ASQ2 = require("./path/to/bundle2.js");
```

In the browser, you need to do something like this:

```html
<script src="asq.js"></script>

<script>ASQ1 = ASQ.clone(); ASQ2 = ASQ.clone();</script>

<script>ASQ = ASQ1;</script>
<script src="./path/to/bundle1.js"></script>

<script>ASQ = ASQ2;</script>
<script src="./path/to/bundle2.js"></script>
```

### Plugin Extensions

`ASQ.extend( {name}, {build} )` allows you to specify an API extension, giving it a `name` and a `build` function callback that should return the implementation of your API extension. The `build` callback is provided two parameters, the sequence `api` instance, and an `internals(..)` method, which lets you get or set values of various internal properties (generally, don't use this if you can avoid it).

Example:

```js
// "foobar" plugin, which injects message "foobar!"
// into the sequence stream
ASQ.extend("foobar",function __build__(api,internals){
    return function __foobar__() {
        api.val(function __val__(){
            return "foobar!";
        });

        return api;
    };
});

ASQ()
.foobar() // our custom plugin!
.val(function(msg){
    console.log(msg); // foobar!
});
```

The `/contrib/` directory includes a variety of [optional contrib plugins](https://github.com/getify/asynquence/blob/master/contrib/README.md) as helpers for async flow-controls. See these plugins for more complex examples of how to extend the *asynquence* API.

For browser usage, simply include the `asq.js` library file and then the `contrib.js` file. For node.js, these contrib plugins are available as a separate npm package: `asynquence-contrib`.

There are also other bundle options included with the npm package, such as `contrib-es6.src.js` and `contrib-common.js`. See [Building Contrib Bundle](https://github.com/getify/asynquence/blob/master/contrib/README.md#building-contrib-bundle) for more information.

#### Iterable Sequences

One of the contrib plugins provided is `iterable-sequence`. Unlike other plugins, which add methods onto the sequence instance API, this plugin adds a new static function directly onto the main module API: `ASQ.iterable(..)`. Calling `ASQ.iterable(..)` creates a special iterable sequence, as compared to calling `ASQ(..)` to create a normal *asynquence* sequence.

An iterable sequence works similarly to normal *asynquence* sequences, but a bit different. `then(..)` still registers steps on the sequence, but it's basically just an alias of `val(..)`, because the most important difference is that steps of an iterable sequence **are not passed completion triggers**.

Instead, an iterable sequence instance API has a `next(..)` method on it, which will allow the sequence to be externally iterated, one step at a time. Whatever is passed to `next(..)` is sent as step message(s) to the current step in the sequence. `next(..)` always returns an *iterator result* object like:

```js
{
    value: ...          // return messages
    done: true|false    // sequence iteration complete?
}
```

**Note:** If the `value` property is absent, it's assumed to be `undefined`, and if the `done` property is absent, it's assumed to be `false`.

`value` is any return message(s) from the `next(..)` invocation (`undefined` otherwise). `done` is `true` if the previously iterated step was (so far) the last registered step in the iterable sequence, or `false` if there's still more sequence steps queued up.

Just like with normal *asynquence* sequences, register one or more error listeners on the iterable sequence by calling `or(..)`. If a step results in some error (either accidentally or manually via `throw ..`), the iterable sequence is flagged in the error state, and any error messages are passed to the registered `or(..)` listeners.

Also, just like `next(..)` externally controls the normal iteration flow of the sequence, `throw(..)` externally "throws" an error into the iterable sequence, triggering the `or(..)` flow as above. Iterable sequences can be `abort()`d just as normal *asynquence* sequences. You can also call `return(..)` (just like on normal iterators), which `abort()`s the sequence and returns an *iterator result* with the value passed in, if any, and `done: true`.

Iterable sequences are a special subset of sequences, and as such, some of the normal *asynquence* API variations do not exist, such as `gate(..)`, `seq(..)`, and `promise(..)`.

```js
function step(num) {
    return "Step " + num;
}

var sq = ASQ.iterable()
    .then(step)
    .then(step)
    .then(step);

for (var i=0, ret;
    (ret = sq.next(i+1)) && !ret.done;
    i++
) {
    console.log(ret.value);
}
// Step 1
// Step 2
// Step 3
```

This example shows sync iteration with a `for` loop, but of course, `next(..)` can be called in various [async ways to iterate](https://gist.github.com/getify/8211148#file-ex2-async-iteration-js) the sequence over time.

Iterable sequence steps can either be a function that produces a value, or a direct (non-function) value itself:

```js
var sq = ASQ.iterable()
    .then(42)
    .then(function(x){
        return x * 2;
    })
    .then("hello world");

sq.next();      // { value: 42 }
sq.next(5);     // { value: 10 }
sq.next();      // { value: "hello world" }
sq.next();      // { done: true }
```

Just like regular sequences, iterable sequences have a `duplicate()` method (see ASQ's instance API above) which makes a copy of the sequence *at that moment*. However, iterable sequences are already "paused" at each step anyway, so unlike regular sequences, there's no `unpause()` (nor is there any reason to use the `ASQ.unpause(..)` helper!), because it's unnecessary. You just call `next()` on an iterable sequence (even if it's a copy of another) when you want to advance it one step.

### Multiple parameters

API methods take one or more functions as their parameters:

* `gate(..)` treats multiple functions as segments in the same gate.
* The other API methods (`then(..)`, `or(..)`, `pipe(..)`, `seq(..)`, and `val(..)`) treat multiple parameters as just separate subsequent steps in the respective sequence. These methods don't accept arrays of functions (that you might build up programatically), but since they take multiple parameters, you can use `.apply(..)` to spread an array of values out.

### Promises/A+ Compliance

**The goal of *asynquence* is that you should be able to use it as your primary async flow-control library, without the need for other Promises implementations.**

-----

If you're looking for actual Promises/A+ compliance, I've just released [Native Promise Only](http://github.com/getify/native-promise-only), a tiny and fast polyfill of purely just the native ES6 `Promise()` mechanism.

-----

*asynquence* is intentionally designed to hide/abstract the idea and use of Promises, such that you can do quick and easy async flow-control programming without some of the hassles/tedium of creating `Promise`s directly.

As such, the *asynquence* API itself is *not [Promises/A+](http://promisesaplus.com/) compliant*, nor *should* it be, because the "promises" used are hidden underneath *asynquence*'s API. **Note:** the hidden promises behave predictably like standard Promises where they need to, so *asynquence* as an abstraction offers the same trust guarantees.

If you are also using other Promises implementations alongside *asynquence*, you *can* quite easily receive and consume a regular Promise value (or thenable) from some other method into the signal/control flow for an *asynquence* sequence.

For example, if using jQuery, the [Q promises library](https://github.com/kriskowal/q), and *asynquence*:

```js
// Using *Q*, make a standard Promise out
// of jQuery's Ajax (non-standard) "promise"
var p = Q( $.ajax(..) );

// Now, asynquence flow-control including a
// standard Promise
ASQ()
.then(function(done){
    setTimeout(done,100);
})
// subsume a standard Promise into the sequence
.promise(p)
.val(function(ajaxResp){
    console.log(ajaxResp);
});
```

**Despite API similarities** (like the presence of `then(..)` on the API), an *asynquence* instance is **not itself** designed to be used *as a Promise value* linked/passed to another standard Promise or other utilities that expect real promises.

Trying to do so will likely cause unexpected behavior, because Promises/A+ insists on problematic (read: "dangerous") duck-typing for objects that have a `then()` method, as *asynquence* instances do.

**However,** if you really need a standard native `Promise` from your sequence, you can use the [`toPromise` contrib plugin](https://github.com/getify/asynquence/blob/master/contrib/README.md#topromise-plugin), which vends/forks an actual native `Promise` off an *asynquence* sequence instance.

## Browser, node.js (CommonJS), AMD: ready!

The *asynquence* library is packaged with a light variation of the [UMD (universal module definition)](https://github.com/umdjs/umd) pattern, which means the same file is suitable for inclusion either as a normal browser .js file, as a node.js module, or as an AMD module. Can't get any simpler than that, can it?

For browser usage, simply include the `asq.js` library file. For node.js usage, install the `asynquence` package via npm, then `require(..)` the module:

```js
var ASQ = require("asynquence");
```

**Note:** The `ASQ.noConflict()` static function really only makes sense when used in a normal browser global namespace environment. It **should not** be used when the node.js or AMD style modules are your method of inclusion.

## Usage Examples

Using the following example setup:

```js
function fn1(done) {
    alert("Step 1");
    setTimeout(done,1000);
}

function fn2(done) {
    alert("Step 2");
    setTimeout(done,1000);
}

function yay() {
    alert("Done!");
}
```

Execute `fn1`, then `fn2`, then finally `yay`:

```js
ASQ(fn1)
.then(fn2)
.then(yay);
```

Pass messages from step to step:

```js
ASQ(function(done){
    setTimeout(function(){
        done("hello");
    },1000);
})
.then(function(done,msg1){
    setTimeout(function(){
        done(msg1,"world");
    },1000);
})
.then(function(_,msg1,msg2){ // basically ignoring this step's completion trigger (`_`)
    alert("Greeting: " + msg1 + " " + msg2);
    // 'Greeting: hello world'
});
```

Handle step failure:

```js
ASQ(function(done){
    setTimeout(function(){
        done("hello");
    },1000);
})
.then(function(done,msg1){
    setTimeout(function(){
        // note the `fail` flag here!!
        done.fail(msg1,"world");
    },1000);
})
.then(function(){
    // sequence fails, won't ever get called
})
.or(function(msg1,msg2){
    alert("Failure: " + msg1 + " " + msg2);
    // 'Failure: hello world'
});
```

Create a step that's a parallel gate:

```js
ASQ()
// normal async step
.then(function(done){
    setTimeout(function(){
        done("hello");
    },1000);
})
// parallel gate step (segments run in parallel)
.gate(
    function(done,greeting){ // gate segment
        setTimeout(function(){
            // 2 gate messages!
            done(greeting,"world");
        },500);
    },
    function(done,greeting){ // gate segment
        setTimeout(function(){
            // only 1 gate message!
            done(greeting + " mikey");
        },100);
        // this segment finishes first, but message
        // still kept "in order"
    }
)
.then(function(_,msg1,msg2){
    // msg1 is an array of the 2 gate messages
    // from the first segment
    // msg2 is the single message (not an array)
    // from the second segment

    alert("Greeting: " + msg1[0] + " " + msg1[1]);
    // 'Greeting: hello world'
    alert("Greeting: " + msg2);
    // 'Greeting: hello mikey'
});
```

Use `pipe(..)`, `seq(..)`, and `val(..)` helpers:

```js
var seq = ASQ()
.then(function(done){
    ASQ()
    .then(function(done){
        setTimeout(function(){
            done("Hello World");
        },100);
    })
    .pipe(done); // pipe sequence output to `done` completion trigger
})
.val(function(msg){ // NOTE: no completion trigger passed in!
    return msg.toUpperCase(); // map return value as step output
})
.seq(function(msg){ // NOTE: no completion trigger passed in!
    var seq = ASQ();

    seq
    .then(function(done){
        setTimeout(function(){
            done(msg.split(" ")[0]);
        },100);
    });

    return seq; // pipe this sub-sequence back into the main sequence
})
.then(function(_,msg){
    alert(msg); // "HELLO"
});
```

Abort a sequence in progress:

```js
var seq = ASQ()
.then(fn1)
.then(fn2)
.then(yay);

setTimeout(function(){
    // will stop the sequence before running
    // steps `fn2` and `yay`
    seq.abort();
},100);

// same as above
ASQ()
.then(fn1)
.then(function(done){
    setTimeout(function(){
        // `abort` flag will stop the sequence
        // before running steps `fn2` and `yay`
        done.abort();
    },100);
})
.then(fn2)
.then(yay);
```

## Builds

The core library file can be built (minified) with an included utility:

```
./build-core.js
```

However, the recommended way to invoke this utility is via npm:

```
npm run-script build-core
```

## License

The code and all the documentation are released under the MIT license.

http://getify.mit-license.org/
