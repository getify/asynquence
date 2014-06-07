(function UMD(name,context,definition){
	// special form of UMD for using a "global" across evironments
	context[name] = context[name] || definition();
	if (typeof module !== "undefined" && module.exports) { module.exports = context[name]; }
	else if (typeof define === "function" && define.amd) { define(function $AMD$(){ return context[name]; }); }
})("fakeWritableStream",typeof global !== "undefined" ? global : this,function DEF(){


	// fake minimal writable streams implementation for
	// non-node testing purposes only
	function fakeWritableStream() {

		function write(chunk,_,cb) {
			this.emit("data",chunk);
			cb();
			return true;
		}

		function end(chunk,_,cb) {
			if (chunk) {
				this.emit("data",chunk);
				this.emit("end");
				cb();
			}
			else {
				cb();
				this.emit("end");
			}
		}

		var publicAPI = new EventEmitter();
		publicAPI.write = write;
		publicAPI.end = end;

		return publicAPI;
	}

	return fakeWritableStream;

});
