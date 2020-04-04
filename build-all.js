#!/usr/bin/env node

var exec = require('child_process').exec,
    ASQ = require('.'),
    commands = ['npm install', function $$cd(done) {
      process.chdir('contrib');
      done();
    }, 'npm install', function $$chdir(done) {
      process.chdir('..');
      done();
    }],
    queue = commands.map(function $$map(v, i) {
      return function $$run(done) {
        console.log('Running step #' + (i + 1));
        if (typeof v == 'function') {
          console.log('Running function in', process.cwd() + '.');
          v(done);
        } else {
          console.log('Running', v, 'in', process.cwd() + '.');
          exec(v, {cwd: process.cwd()}, done.errfcb);
        }
      };
    });
var seq = ASQ(function (done) {
  console.log('*** Starting Build ***');
  done();
});
queue.forEach(function (v, i) {
  seq.then(v);
});
seq.val(function () {
  console.log('*** Finishing Build ***');
});