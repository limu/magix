/**
 * Controller负责按照规则将hash值Route至指定的View.
 * @module controller
 * @requires backbone,undersocre,app/config/ini
 */
/**
 * Controller负责按照规则将hash值Route至指定的View.
 * @class Controller
 * @namespace libs.magix
 * @static
 */
define(function(require, exports, module) {
	var Backbone = require("libs/backbone");
	var _ = require("libs/underscore");
	var config = require("app/config/ini");

	var MxController = function() {
		this.initialize();
	};

	_.extend(MxController.prototype, Backbone.Event, {
		initialize : function(o) {
			var p2v = config.pathViewMap, viewName;
			for(var k in p2v) {
				if(!p2v[k]) {
					p2v[k] = config.defaultViewName;
				}
			}
			/**
			 * 存储全局共享信息,<br/>
			 * 如require("libs/magix/controller").env.templates存储模板
			 * @property env
			 * @type Object
			 */
			this.env = {
				appHome : config.uri.split("app/config/")[0],
				templates : {}
			};
			return this;
		},
		_route : function(query) {
			this.referrer = this.query || null;
			this.query = query;
			this.pathName = config.indexPath;
			this.paraObj = {};
			this._fixPathPara(query);
			this.oldViewName = this.viewName;
			this.viewName = this._getViewName();
			this._mountView();
			this.postData = null;
		},
		setPostData : function(o) {
			this.postData = o;
		},
		/**
		 * 将传入的queryString Merge到当前的hashQuery中,生成新的query.<br/>
		 * 原hash: #!/a/b/x=1&y=2&offset=20<br/>
		 * reqiure("libs/magix/controller").navigateTo("z=1&offset=0");<br/>
		 * 新hash: #!/a/b/x=1&y=2&z=3&offset=0<br/>
		 * @method navigateTo
		 * @param {Object} queryString
		 */
		navigateTo : function(q) {
			var np = this.unParam(q);
			var v1 = _.clone(this.paraObj);
			delete v1.referrer;
			delete v1.pathname;
			delete v1.query;
			delete v1.postdata;
			var v2 = _.extend(v1, np);
			var nps = this.param(v2);
			//var nps = this.param(_.extend(_.clone(this.paraObj),np));
			this._goto(this.pathName + "/" + nps);
		},
		_goto : function(url) {
			location.hash = "!" + url;
		},
		/**
		 * 查询对象,包含query,pathname,referrer,postData和hash包含的众多参数<br/>
		 * 这是一个Backbone.Model对象实例,可以通过监听该对象的change事件,监视url的变化.<br/>
		 * hash解析规则,"#!/a/b/x=1&y=2&z=3" 等同于 "#/a/b/x=1&y=2&z=3",将被解析为:<br/>
		 * {<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;referrer:null,<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;postdata:null,<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;pathname:"/a/b",<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;query:"/a/b/x=1&y=2&z=3",<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;x:"1",<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;y:"2",<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;z:"3"<br/>
		 * }
		 * @property queryModel
		 * @type Backbone.Model
		 */
		_mountView : function() {
			var self = this;
			var queryObject = this._getQueryObject();
			if(this.viewName == this.oldViewName) {
				this._fixQueryObject(queryObject);
				this.queryModel.set(queryObject);
			} else {
				require.async("./vom", function(vom) {
					self.queryModel = new Backbone.Model(queryObject);
					vom.root.mountView(self.viewName, {
						queryModel : self.queryModel
					});
				});
			}
		},
		_fixQueryObject : function(queryObject) {
			if(this.queryModel) {
				var k, old = this.queryModel.toJSON();
				for(k in old) {
					if(!( k in queryObject)) {
						this.queryModel.unset(k, {
							silent : true
						});
					}
				}
			}
		},
		_getQueryObject : function() {
			var queryObject = _.extend(this.paraObj, {
				referrer : this.referrer,
				query : this.query,
				pathname : this.pathName,
				postdata : this.postData || null
			});
			return queryObject;
		},
		_getViewName : function() {
			var p2v = config.pathViewMap, viewName;
			if(p2v[this.pathName]) {
				viewName = p2v[this.pathName];
			} else {
				viewName = p2v[config.notFoundPath];
			}
			if(this.paraObj.__view__) {
				viewName = this.paraObj.__view__.split("-").join("/");
			}
			return viewName;
		},
		_fixPathPara : function(query) {
			var tmpArr, paraStr, kv;
			if(query) {
				tmpArr = query.split("/");
				paraStr = tmpArr.pop();
				this.pathName = tmpArr.join("/");
				this.paraObj = this.unParam(paraStr);
			}
		},
		/**
		 * 将传入的queryObject转化为key1=value1&key2=value2的queryString
		 * @method param
		 * @param {Object} queryObject
		 * @return {String}
		 */
		param : function(o) {
			var res = [];
			for(var k in o) {
				if(o.hasOwnProperty(k)) {
					res.push(k + "=" + o[k]);
				}
			}
			return res.join("&");
		},
		/**
		 * 与param方法的相反,将传入的queryString转化为Object
		 * @method unParam
		 * @param {String} queryString
		 * @return {Object}
		 */
		unParam : function(s) {
			var paraArr = s.split("&");
			var kv, res = {};
			for(var i = 0; i < paraArr.length; i++) {
				kv = paraArr[i].split("=");
				if(kv[0]) {
					res[kv[0]] = kv[1] || "";
				}
			}
			return res;
		}
	});
	if(!MxController.inst) {
		MxController.inst = new MxController();
	}
	window.MXController = MxController.inst;
	return MxController.inst;
});
