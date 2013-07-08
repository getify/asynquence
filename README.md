# asynquence

A lightweight API for asynchronous sequences and gates.

## Explanation

Say you want do two or more asynchronous tasks one after the other (like animation delays, XHR calls, etc). You want to set up an ordered sequence of tasks and make sure the previous one finishes before the next one is processed. You need a sequence.

You create a sequence by calling `ASQ(...)`. **Each time you call `ASQ()`, you create a new, separate sequence.**

To create a new step, simply call `then(...)` with a function (or multiple functions, see below). That function will be executed when that step is ready to be processed, and it will be passed as its first parameter the completion trigger. Subsequent parameters, if any, will be any messages passsed on from the immediately previous step.

The completion trigger that your step function(s) receive can be called directly to indicate success, or you can add the `fail` flag (see examples below) to indicate failure of that step. In either case, you can pass one or more messages onto the next step (or the next failure handler) by simply adding them as parameters to the call.

If you register a step using `then(...)` on a sequence which is already currently complete, that step will be processed immediately. Otherwise, calls to `then(...)` will be queued up until that step is ready for processing.

You can register multiple steps, and multiple failure handlers. However, messages from a previous step (success or failure completion) will only be passed to the immediately next registered step (or the next failure handler). If you want to propagate along a message through multiple steps, you must do so yourself by making sure you re-pass the received message at each step completion.

To listen for any step failing, call `or(...)` on your sequence to register a failure callback. You can call `or()` as many times as you would like. If you call `or()` on a sequence that has already been flagged as failed, the callback you specify will just be executed immediately.

Passing in multiple functions to `ASQ(...)` or `then(...)` creates an [implicit async parallel gate (aka asyncGate.js)](http://github.com/getify/asyncGate.js) across those functions, such that the single step in question isn't complete until all segments of the parallel gate are complete.

For implicit parallel gate steps, each segment of that gate will receive a copy of the message(s) passed from the previous step. Also, all messages from the segments of this gate will be passed along to the next step (or the next failure handler, in the case of a gate segment indicating a failure).

You can also `abort()` a sequence at any time, which will prevent any further actions from occurring on that sequence (all callbacks will be ignored). The call to `abort()` can happen on the sequence API itself, or using the `abort` flag on a completion callback in any step (see example below).

**NOTE: this code explicitly depends on [asyncGate.js](http://github.com/getify/asyncGate.js).** Either "ag.js" (or "ag.src.js") must be present prior to including "as.js" (or "as.src.js"), or you must bundle the two together in the proper order.

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
    // implicit async parallel gate (segments will go in parallel!) step
    .gate(
        function(done,msg1){ // gate segment
            setTimeout(function(){
                done(msg1,"world");
            },500);
        },
        function(done,msg1){ // gate segment
            setTimeout(function(){
                done(msg1,"mikey");
            },1000);
        }
    })
    .then(function(_,msg1,msg2){
        alert("Greeting: " + msg1[0] + " " + msg1[1]); // 'Greeting: hello world'
        alert("Greeting: " + msg2[0] + " " + msg2[1]); // 'Greeting: hello mikey'
    });

Abort a sequence in progress:

    var steps = ASQ()
    .then(fn1)
    .then(fn2)
    .then(yay);
    setTimeout(function(){
        steps.abort(); // will stop the sequence before running steps `fn2` and `yay`
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
