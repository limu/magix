/*
 * maigx/base template
 * 	concrete members:
 * 		extend:magix自用继承实现
 * 	abstract members:
 * 		iF:是否为函数
 * 		iA:是否为数组
 * 		iS:是否为字符串
 * 		iPO:是否为纯js对象
 */
Base.mix(Base, {
	isFunction : Base.unimpl,
	isArray : Base.unimpl,
	isString : Base.unimpl,
	isPlainObject : Base.unimpl,
	requireAsync : Base.unimpl,
	Events : Base.unimpl,
	_idCounter : 0,
	uniqueId : function (prefix) {
		var id = this._idCounter++;
		return prefix ? prefix + id : id;
	},
	extend : function (r, s, px, sx) {
		if (!s || !r) {
			return r;
		}
		var OP = Object.prototype,
		O = function (o) {
			function F() {}			
			F.prototype = o;
			return new F();
		},
		sp = s.prototype,
		rp = O(sp);
		r.prototype = rp;
		rp.constructor = r;
		r.superclass = sp;
		if (s !== Object && sp.constructor === OP.constructor) {
			sp.constructor = s;
		}
		if (px) {
			this.mix(rp, px);
		}
		if (sx) {
			this.mix(r, sx); //,false);
		}
		/*for(var p in rp){
		r.prototype[p]=rp[p];
		}*/
		return r;
		
	},
	param : function (o) {
		var res = [];
		for (var k in o) {
			if (o.hasOwnProperty(k)) {
				res.push(k + "=" + o[k]);
			}
		}
		return res.join("&");
	},
	unParam : function (s) {
		var paraArr = s.split("&");
		var kv,
		res = {};
		for (var i = 0; i < paraArr.length; i++) {
			kv = paraArr[i].split("=");
			if (kv[0]) {
				res[kv[0]] = kv[1] || "";
			}
		}
		return res;
	},
	mixClassStaticProps : function (aim, src) {
		for (var p in src) {
			if (src.hasOwnProperty(p) && p != 'prototype') {
				aim[p] = src[p];
			}
		}
		return aim;
	},
	mixClassProtoProps : function (aim, src) {
		for (var p in src) {
			if (!aim[p] || aim[p] == Base.unimpl) {
				aim[p] = src[p];
			}
		}
		return aim;
	},
	implement : function (tmpl, impl) {
		if (Base.isFunction(tmpl) && Base.isFunction(impl)) {
			impl.prototype.constructor = impl;
			var finalClass = function () {
				impl.apply(this, arguments);
				tmpl.apply(this, arguments);
				if (tmpl.prototype.initial) {
					tmpl.prototype.initial.apply(this, arguments);
				}
				if (impl.prototype.initial) {
					impl.prototype.initial.apply(this, arguments);
				}
			};
			//
			this.mixClassStaticProps(finalClass, tmpl);
			this.mixClassStaticProps(finalClass, impl);
			//
			this.mixClassProtoProps(finalClass.prototype, tmpl.prototype);
			this.mixClassProtoProps(finalClass.prototype, impl.prototype);
			//
			finalClass.prototype.constructor = finalClass;
			return finalClass;
		} else {
			var finalObject = {};
			Base.mix(finalObject, tmpl);
			Base.mix(finalObject, impl);
			return finalObject;
		}
	}
});
