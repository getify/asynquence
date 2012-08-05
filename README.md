# asyncSteps.js

A lightweight API for performing serial async tasks ("steps"), each in succession.

## Explanation

Say you want do two or more asynchronous tasks in one after the other (like animation delays, XHR calls, etc). You want to set up an ordered sequence of tasks and make sure the previous one finishes before the next one is processed. You need a step chain.

You create a step chain by calling `$AS(...)`. **Each time you call `$AS()`, you create a new, separate step chain.**

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

Execute `fn1` and `fn2` in parallel, then call `yay` when complete:

    $AS(fn1)
    .then(fn2)
    .then(yay);
    
## License 

The code and all the documentation are released under the MIT license.

http://getify.mit-license.org/
