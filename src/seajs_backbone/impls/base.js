define("magix/impls/base", ["backbone"], function(require) {
	var Backbone = require("backbone"),
		toString=Object.prototype.toString;
	var iBase = {
		isFunction : function(o) {
			return toString.call(o) === '[object Function]';
		},
		isArray : function(o) {
			return toString.call(o) === '[object Array]';
		},
		isString : function(o) {
			return toString.call(o) === '[object String]';
		},
		isPlainObject : function(o) {
			return o && toString.call(o) === '[object Object]' && !o.nodeType && !o.setInterval;
		},
		requireAsync : function(modName, fn) {
			console.log("Base.requireAsync",modName,fn,fn.toString())
			require.async(modName, fn);
		},
		Events : Backbone.Events
	};
	return iBase;
});
