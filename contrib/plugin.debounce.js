// "debounce"
ASQ.extend("debounce",function $$extend(api,internals){
  return function $$debounce(num) {
    var orig_args = arguments.length > 1 ?
      ARRAY_SLICE.call(arguments,1) :
      void 0
    ;
    var timeoutID;
    num = +num || 0;

    api.then(function $$then(done){
      var args = orig_args || ARRAY_SLICE.call(arguments,1);

      if (timeoutID) {
        clearTimeout(timeoutID);
      }

      timeoutID = setTimeout(function $$set$timeout(){
        timeoutID = null;
        done.apply(ø,args);
      },num);
    });

    return api;
  };
});

ASQ.debounce = function $$debounce() {
  return ASQ().debounce.apply(ø,arguments);
};
