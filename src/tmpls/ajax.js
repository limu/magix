Ajax = {
	defaultOptions : { //默认ajax请求参数
		dataType : 'html',
		method : 'POST',
		success : function () {},
		error : function () {}
	},
	/*
		ajax请求全局设置
		先支持statusCode={404:function(){},403:...};
	 */
	globalSetting : function (settings) {
		var me = this;
		if (!me.$globalSetting)
			me.$globalSetting = {};
		for (var p in settings) {
			me.$globalSetting[p] = settings[p];
		}
		return me.$globalSetting;
	},
	/*
	触发全局设置
	 */
	fireGlobalSetting : function (xhr) {
		var me = this,
			gSetting = me.$globalSetting,
			codes;
		try{
		if (gSetting && gSetting.statusCode) {
			codes = gSetting.statusCode;
			if (codes[xhr.status]) {
				try{
					codes[xhr.status](xhr);
				}catch(e){
					console.log(e);
				}
			}
		}}catch(ex){console.log(ex)}
	},
	/*
	 * 发送异步请求
	 * 默认支持dataType url success error 四个参数
	 */
	send : Base.unimpl,
	/*
	 * 处理请求的参数，方便在send方法中直接使用相应的属性，避免判断
	 */
	processOptions : function (ops) {
		var me = this;
		if (!ops)
			ops = {};
		for (var p in me.defaultOptions) {
			if (!ops[p]){
				ops[p] = me.defaultOptions[p];
			}
		}
		return ops;
	},
	templates:{},
	/*
	 * 获取模板内容
	 */
	getTemplate : function (url, succ, fail) {
		var me = this,
			data = me.templates[url];
		if (data) {
			if (Base.isFunction(succ)) {
				succ(data);
			}
			return;
		}
		me.send({
			url : url,
			dataType : 'html',
			method:'GET',
			success : function (data) {
				me.templates[url] = data;
				if (Base.isFunction(succ)) {
					succ(data);
				}
			},
			error : function (msg) {
				if (Base.isFunction(fail)) {
					fail(msg);
				}
			}
		});
	}
};
