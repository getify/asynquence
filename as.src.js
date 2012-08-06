/*! asyncSteps.js
    v0.1 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function(global){

  var old_$AS = global.$AS;

  // test for array
  function is_array(arr) { return Object.prototype.toString.call(arr) == "[object Array]"; }
  
  // flatten array
  function flatten_array(arr) {
    for (var i=0; i<arr.length; ) {
      if (is_array(arr[i])) {
        // prepend `splice()` arguments to `tmp` array, to enable `apply()` call
        arr.splice.apply(arr,[i,1].concat(arr[i]));
        continue;
      }
      i++;
    }
    
    return arr;
  }

  function create_sandbox() {
    var instanceAPI;
    
    instanceAPI = function() {
      function do_then_queue() {
        var next, i, _msgs;
        if (then_queue.length) {
          _msgs = msgs.slice();
          msgs = [];
          next = then_queue.shift();
          current_gate = $AG();
          for (i=0; i<next.length; i++) {
            (function(fn){
              current_gate.and(function(done){
                var args = _msgs.slice();
                args.unshift(done);
                fn.apply(fn,args);
              });
            })(next[i]);
          }
          current_gate.then(gate_finish).or(gate_error);
          _msgs = null;
        }
        else current_gate = null;
      }

      function do_or_queue(){
        var fn;

        // reset the success queue
        then_queue = true;
        
        // make sure at least one error callback is registered
        if (or_queue !== true && or_queue.length) {
          // empty the queue
          while (fn = or_queue.shift()) {
            if (msgs.length > 0) {
              fn.apply({},msgs);
              msgs = [];
            }
            else fn.call({});
          }
        }

        or_queue = true; // flag it as complete
        current_gate = null;
      }

      function gate_finish() {
        var args = [].slice.call(arguments), i;
        if (!chain_error) {
          if (arguments.length) {
            for (i=0; i<args.length; i++) {
              if (is_array(args[i]) && args[i].length == 1) msgs.push(args[i][0]);
              else msgs.push(args[i]);
            }
          }
          console.log("gate_finish: " + JSON.stringify(msgs));
          do_then_queue();
        }
      }

      function gate_error() {
        var args = [].slice.call(arguments), i;
        if (!chain_error) {
          chain_error = true;

          if (arguments.length) {
            for (i=0; i<args.length; i++) {
              if (is_array(args[i]) && args[i].length == 1) msgs.push(args[i][0]);
              else msgs.push(args[i]);
            }
          }
          console.log("gate_error: " + JSON.stringify(msgs));
          do_or_queue();
        }
      }

      function raw_trigger() {
        var gate = $AG(), trigger_done = gate.and(), trigger;

        trigger = function() {
          var args = [].slice.call(arguments), fn;

          fn = function(done){ done.apply({},args); };
          fn.__wrapper__ = true;

          trigger_done(fn);
        };
        trigger.fail = function() {
          var args = [].slice.call(arguments), fn;

          fn = function(done){ done.fail.apply({},args); };
          fn.__wrapper__ = true;

          trigger_done(fn);
        };

        gate
        .and(function(then_done){
          then_queue.push([function(doneFn){
            then_done(doneFn);
          }]);
        })
        .then(function(wrapper,done){
          var tmp;
          wrapper = wrapper[0];
          done = done[0];
          // if the params are switched, swap 'em
          if (!wrapper.__wrapper__) { tmp = wrapper; wrapper = done; done = tmp; }

          wrapper(done);
        });

        return trigger;
      }

      var chainAPI,
          current_gate,
          then_queue = [],
          or_queue = [],
          msgs = [],
          chain_error = false
      ;
            
      chainAPI = {
        then: function(){
          // has the step chain already error'd? if so, bail
          if (chain_error) return chainAPI;

          var args = flatten_array([].slice.call(arguments)), ret;

          // special case: if no arguments provided, return a trigger directly
          if (args.length == 0) {
            ret = raw_trigger();
          }
          else {
            then_queue.push(args);
            ret = chainAPI;
          }
          if (!current_gate) {
            do_then_queue();
          }

          return ret;
        },
        or: function(fn){
          if (or_queue !== true) {
            or_queue.push(fn);
          }
          else {
            fn.apply({},msgs);
            msgs = [];
          }

          return chainAPI;
        }
      };
      
      // add in arguments passed as constructor parameters
      if (arguments.length > 0) chainAPI.then.apply({},arguments);
      
      return chainAPI;
    };
     
    // rollback to a previous $AS global ref, if any
    // and return this copy
    instanceAPI.noConflict = function() {
      var new_$AS = global.$AS;
      global.$AS = old_$AS;
      return new_$AS;
    };
    
    // create a fresh, clean, sandboxed copy of the current $AS
    instanceAPI.sandbox = function() {
      return create_sandbox();
    };
    
    return instanceAPI;
  }
  
  global.$AS = create_sandbox();

})(this);