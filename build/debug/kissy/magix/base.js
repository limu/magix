/*
 * magix/base:提供一些基础方法供各个模块使用
 * 其中mix,include,unimpl方法是模板模块与实现模块分离的基础,需最先定义在实现模块中
 * 		mix(r,s,ov,wl):将s的内容混入r，ov=true：覆盖,wl=undefined:白名单
 * 		include:仅开发时使用,讲template模块同名文件,通过xhr同步获取后eval执行
 * 		unimpl:一个固定函数,用作每个abstract方法的初始值,如果abstract方法未实现,调用这个会抛出异常
 */
KISSY.add("magix/base", function(S,impl) {
	var mix = function mix(r, s, ov, wl) {
		if(!s || !r) {
			return r;
		}
		if(ov === undefined) {
			ov = true;
		}
		var i, p, l;
		if(wl && ( l = wl.length)) {
			for( i = 0; i < l; i++) {
				p = wl[i];
				if( p in s) {
					if(ov || !( p in r)) {
						r[p] = s[p];
					}
				}
			}
		} else {
			for(p in s) {
				if(ov || !( p in r)) {
					r[p] = s[p];
				}
			}
		}
		return r;
	};
	var include = function include(path) {
		var url = Magix.config.magixHome + "../" + path + ".js?r=" + Math.random();
		var xhr = window.ActiveXObject || XMLHttpRequest;
		var r = new xhr('Microsoft.XMLHTTP');
		r.open('GET', url, false);
		r.send(null);
		return r.responseText;
	};
	var unimpl = function UNIMPLEMENTED() {
		
		throw new Error("unimplement method");
	};
	var Base = {};
	Base.mix = mix;
	Base.include = include;
	Base.unimpl = unimpl;
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

	Base.mix(Base, impl);
	return Base;
},{
	requires:["magix/impls/base"]
});
