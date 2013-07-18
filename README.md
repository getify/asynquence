# asynquence

A lightweight API for asynchronous sequences and gates. [Sequences & gates, at a glance](https://gist.github.com/getify/5959149)

## *asynquence* & Promises

**You should be able to use *asynquence* as your primary async flow control library, without the need for other Promises implementations.**

This lib is intentionally designed to hide/abstract the idea of Promises, such that you can do quick and easy async flow control programming without using Promises directly. As such, *asynquence* is *not [Promises/A+](http://promisesaplus.com/) compliant*, nor *should* it be, because the "promises" used are hidden underneath *asynquence*'s API.

If you are already using other Promises implementations, you *can* quite easily receive and consume a regular Promise value from some other method and wire it up to signal/control flow for an *asynquence* instance.

**However**, despite API similarities, an *asynquence* instance is **not** designed to be used *as a Promise value* passed to a regular Promises-based system. Trying to do so will likely cause unexpected behavior, because Promises/A+ suggests problematic (read: "dangerous") duck-typing for objects that have a `then()` method, as `asynquence` instances do.

## Explanation

Say you want do two or more asynchronous tasks one after the other (like animation delays, XHR calls, etc). You want to set up an ordered sequence of tasks and make sure the previous one finishes before the next one is processed. You need a sequence.

You create a sequence by calling `ASQ(...)`. **Each time you call `ASQ()`, you create a new, separate sequence.**

To create a new step, simply call `then(...)` with a function (or multiple functions, see below). That function will be executed when that step is ready to be processed, and it will be passed as its first parameter the completion trigger. Subsequent parameters, if any, will be any messages passsed on from the immediately previous step.

The completion trigger that your step function(s) receive can be called directly to indicate success, or you can add the `fail` flag (see examples below) to indicate failure of that step. In either case, you can pass one or more messages onto the next step (or the next failure handler) by simply adding them as parameters to the call.

If you register a step using `then(...)` on a sequence which is already currently complete, that step will be processed immediately. Otherwise, calls to `then(...)` will be queued up until that step is ready for processing.

You can register multiple steps, and multiple failure handlers. However, messages from a previous step (success or failure completion) will only be passed to the immediately next registered step (or the next failure handler). If you want to propagate along a message through multiple steps, you must do so yourself by making sure you re-pass the received message at each step completion.

To listen for any step failing, call `or(...)` on your sequence to register a failure callback. You can call `or()` as many times as you would like. If you call `or()` on a sequence that has already been flagged as failed, the callback you specify will just be executed immediately.

Calling `gate(..)` with two or more functions creates a step that is a parallel gate across those functions, such that the single step in question isn't complete until all segments of the parallel gate are complete.

For parallel gate steps, each segment of that gate will receive a copy of the message(s) passed from the previous step. Also, all messages from the segments of this gate will be passed along to the next step (or the next failure handler, in the case of a gate segment indicating a failure).

There are a few convenience methods on the API, as well:

* `pipe(..)` takes one or more completion triggers from other sequences, treating each one as a separate step in the sequence in question. These completion triggers will, in turn, be piped both the success and failure streams from the sequence.

* `seq(..)` takes one or more functions, treating each one as a separate step in the sequence in question. These functions are expected to return new sequences, from which, in turn, both the success and failure streams will be piped back to the sequence in question.

* `val(..)` takes one or more functions, treating each one as a separate step in the sequence in question. These functions can each optionally return a value, each value of which will, in turn, be passed as the completion value for that sequence step.

You can also `abort()` a sequence at any time, which will prevent any further actions from occurring on that sequence (all callbacks will be ignored). The call to `abort()` can happen on the sequence API itself, or using the `abort` flag on a completion trigger in any step (see example below).

`ASQ.noConflict()` rolls back a browser's global `ASQ` symbol and returns the current API instance to you. This can be used to keep your browser global namespace clean, or it can be used to have multiple simultaneous libraries (including separate versions/copies of *asynquence*!) in the same page without conflicts over the `ASQ` global symbol. 

## Browser, node.js (CommonJS), AMD: ready!

The *asynquence* library is packaged with a light variation of the [UMD (universal module definition)](https://github.com/umdjs/umd) pattern, which means the same file is suitable for inclusion either as a normal browser .js file, as a node.js module, or as an AMD module. Can't get any simpler than that, can it?

**Note:** The `ASQ.noConflict()` method really only makes sense when used in a normal browser global namespace environment. It **should not** be used when the node.js or AMD style modules are your method of inclusion. 

## Usage Examples

Using the following example setup:

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

Execute `fn1`, then `fn2`, then finally `yay`:

    ASQ(fn1)
    .then(fn2)
    .then(yay);

Pass messages from step to step:

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
        alert("Greeting: " + msg1 + " " + msg2); // 'Greeting: hello world'
    });

Handle step failure:

    ASQ(function(done){
        setTimeout(function(){
            done("hello");
        },1000);
    })
    .then(function(done,msg1){
        setTimeout(function(){
            done.fail(msg1,"world"); // note the `fail` flag here!!
        },1000);
    })
    .then(function(){
        // sequence fails, won't ever get called
    })
    .or(function(msg1,msg2){
        alert("Failure: " + msg1 + " " + msg2); // 'Failure: hello world'
    });

Create a step that's a parallel gate:

    ASQ()
    // normal async step
    .then(function(done){
        setTimeout(function(){
            done("hello");
        },1000);
    })
    // parallel gate step (segments run in parallel)
    .gate(
        function(done,msg1){ // gate segment
            setTimeout(function(){
                done(msg1,"world");
            },500);
        },
        function(done,msg1){ // gate segment
            setTimeout(function(){
                done(msg1,"mikey");
            },100); // segment finishes first, but message still kept "in order"
        }
    )
    .then(function(_,msg1,msg2){
        alert("Greeting: " + msg1[0] + " " + msg1[1]); // 'Greeting: hello world'
        alert("Greeting: " + msg2[0] + " " + msg2[1]); // 'Greeting: hello mikey'
    });

Use `pipe(..)`, `seq(..)`, and `val(..)` helpers:

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

Abort a sequence in progress:

    var seq = ASQ()
    .then(fn1)
    .then(fn2)
    .then(yay);

    setTimeout(function(){
        seq.abort(); // will stop the sequence before running steps `fn2` and `yay`
    },100);
    
    // same as above
    ASQ()
    .then(fn1)
    .then(function(done){
        setTimeout(function(){
            done.abort(); // `abort` flag will stop the sequence before running steps `fn2` and `yay`
        },100);
    })
    .then(fn2)
    .then(yay);

## License 

The code and all the documentation are released under the MIT license.

http://getify.mit-license.org/
