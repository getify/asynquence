if (!Object.create) {
	Object.create = function(o) {
		function F(){}
		F.prototype = o;
		return new F();
	};
}
(function(){
	try {
		Object.defineProperty({},"x",{});
	}
	catch (err) {
		Object.defineProperty = function(obj,prop,desc) {
			obj[prop] = desc.value;
			return obj;
		};
	}
})();
if (!Object.keys) {
	Object.keys = function(obj){
		var result = [], prop;
		for (prop in obj) {
			if (Object.prototype.hasOwnProperty.call(obj,prop)) {
				result.push(prop);
			}
		}
		return result;
	};
}
// Adapted From:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
	Function.prototype.bind = function(oThis) {
		var aArgs = Array.prototype.slice.call(arguments,1),
			fToBind = this,
			fNOP = function(){},
			fBound = function(){
				return fToBind.apply(
					this instanceof fNOP && oThis ? this : oThis,
					aArgs.concat(Array.prototype.slice.call(arguments))
				);
			}
		;
		fBound.prototype = Object.create(this.prototype);
		return fBound;
	};
}
// Adapted From:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === "[object Array]";
	};
}
// Adapted From:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(fn) {
		var t = Object(this);
		var len = t.length >>> 0;
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i=0; i<len; i++) {
			if (i in t) {
				fn.call(thisArg,t[i],i,t);
			}
		}
	};
}
// Adapted From:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
	Array.prototype.some = function(fn) {
		var t = Object(this);
		var len = t.length >>> 0;
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i=0; i<len; i++) {
			if (i in t && fn.call(thisArg,t[i],i,t)) {
				return true;
			}
		}
		return false;
	};
}
// Adapted From:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(searchElement,fromIndex) {
		var length = this.length >>> 0; // Hack to convert object.length to a UInt32
		fromIndex = +fromIndex || 0;
		if (Math.abs(fromIndex) === Infinity) {
			fromIndex = 0;
		}
		if (fromIndex < 0) {
			fromIndex += length;
			if (fromIndex < 0) {
				fromIndex = 0;
			}
		}
		for (;fromIndex<length; fromIndex++) {
			if (this[fromIndex] === searchElement) {
				return fromIndex;
			}
		}
		return -1;
	};
}
// Adapted From:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
if (!Array.prototype.map) {
	Array.prototype.map = function(fn) {
		var t = Object(this);
		var len = t.length >>> 0;
		var res = new Array(len);
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i = 0; i < len; i++) {
			if (i in t) {
				res[i] = fn.call(thisArg,t[i],i,t);
			}
		}
		return res;
	};
}
