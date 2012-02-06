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
	eval(Base.include("../tmpls/base"));
	Base.mix(Base, impl);
	return Base;
},{
	requires:["magix/impls/base"]
});
