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
define("magix/controller", ["underscore", "backbone", "app/config/ini"], function(require, exports, module) {
	var _ = require("underscore");
	var Backbone = require("backbone");
	var appConfig = require("app/config/ini");
	var MxController = function(magixConfig) {
		this.initialize(magixConfig);
	};
	_.extend(MxController.prototype, Backbone.Events, {
		initialize : function(magixConfig) {
			this._fixAppConfig();
			this._magixConfig = magixConfig;
			this._appConfig = appConfig;
			/**
			 * 存储全局共享信息,<br/>
			 * 如require("magix/controller").env.templates存储模板
			 * @property env
			 * @type Object
			 */
			this.env = {
				templates : {},
				appHome : magixConfig.appHome
			};
		},
		_fixAppConfig : function() {
			var p2v = appConfig.pathViewMap;
			for(var k in p2v) {
				if(!p2v[k]) {
					p2v[k] = appConfig.defaultViewName;
				}
			}
		},
		route : function(hashQuery) {
			//生成this.location对象.内部分别解析hash和search
			this.location = this._parseLocation(hashQuery);
			//生成this.queryObject对象.获得的是规则定义后的query对象
			this.query = this._generateQuery(this);
			//获得viewname
			this.oldViewName = this.viewName;
			this.viewName = this._getViewName();
			//由queryObject生成QueryModel
			this.queryModel = this._generateQueryModel();
			//mountview
			this._mountView();
			//clear postData
			this.postData = null;
		},
		_mountView : function() {
			var self = this;
			if(this.viewName != this.oldViewName) {
				require.async("magix/vom", function(vom) {
					vom.root.mountView(self.viewName, {
						queryModel : self.queryModel
					});
				});
			}
		},
		_getViewName : function() {
			var p2v = this._appConfig.pathViewMap, viewName;
			if(p2v[this.query.pathname]) {
				viewName = p2v[this.query.pathname];
			} else {
				viewName = p2v[this._appConfig.notFoundPath];
			}
			if(this.query.__view__) {
				viewName = this.query.__view__.split("-").join("/");
			}
			//multipage
			if(this._magixConfig.multipage) {
				var schPath = p2v[this.query["sch:pathname"]];
				if( typeof schPath == "object") {
					viewName = schPath[this.query.pathname] || schPath[this._appConfig.notFoundPath];
				} else {
					document.body.id = "vc-root";
					viewName = schPath || this._appConfig.defaultRootViewName;
				}
			}
			return viewName;
		},
		_generateQueryModel : function() {
			if(this.viewName == this.oldViewName) {
				this._fixQueryModel(this.query);
				this.queryModel.set(this.query);
			} else {
				this.queryModel = new Backbone.Model(this.query);
			}
			return this.queryModel;
		},
		_fixQueryModel : function(query) {
			if(this.queryModel) {
				var k, old = this.queryModel.toJSON();
				for(k in old) {
					if(!( k in query)) {
						this.queryModel.unset(k, {
							silent : true
						});
					}
				}
			}
		},
		_generateQuery : function(ctrl) {
			var query = _.extend({}, ctrl.location.hash.paraObj, {
				referrer : ctrl.location.hash.referrer,
				query : ctrl.location.hash.query,
				pathname : ctrl.location.hash.pathName,
				postdata : ctrl.location.hash.postData || null
			});
			var multipage = {}, schKey, schPara = ctrl.location.search.paraObj;
			if(ctrl._magixConfig.multipage) {
				multipage["sch:pathname"] = ctrl.location.search.pathName;
				for(schKey in schPara) {
					multipage["sch:" + schKey] = schPara[schKey];
				}
				_.extend(query, multipage);
			}
			return query;
		},
		_parseLocation : function(hashQuery) {
			var location = {};
			location.hash = this._parseHash(hashQuery);
			location.search = this._parseSearch();
			return location;
		},
		_parseSearch : function() {
			var search = {}, prefix = this._magixConfig.pathPrefix || null;
			search.pathName = location.pathname;
			search.paraObj = {};
			if(prefix) {
				search.pathName = location.pathname.split(prefix)[1];
			}
			if(location.search) {
				search.paraObj = this.unParam(location.search.substr(1));
			}
			return search;
		},
		_parseHash : function(hashQuery) {
			var hash = {}, tmpArr, paraStr, kv;
			hash.pathName = this._appConfig.indexPath;
			hash.paraObj = {};
			hash.referrer = (this.location && this.location.hash && this.location.hash.query) || null;
			hash.query = hashQuery;
			if(hashQuery) {
				tmpArr = hashQuery.split("/");
				paraStr = tmpArr.pop();
				hash.pathName = tmpArr.join("/");
				hash.paraObj = this.unParam(paraStr);
			}
			return hash;
		},
		setPostData : function(o) {
			this.postData = o;
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
		},
		/**
		 * 将传入的queryString Merge到当前的hashQuery中,生成新的query.<br/>
		 * 原hash: #!/a/b/x=1&y=2&offset=20<br/>
		 * reqiure("magix/controller").navigateTo("z=1&offset=0");<br/>
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
		}
	});
	if(!MxController.inst) {
		MxController.inst = new MxController(Magix.config || {});
	}
	window.MXController = MxController.inst;
	return MxController.inst;
});
