define("magix/impls/router", ["magix/base", "magix/model", "magix/vom", "app/config/ini"], function(require) {
	var Base = require("magix/base");
	var Model = require("magix/model");
	var VOM = require("magix/vom");
	var appConfig = require("app/config/ini");
	var iRouter = {
		getAppConfig : function() {
			var p2v = appConfig.pathViewMap;
			if(appConfig.defaultViewName) {
				for(var k in p2v) {
					if(!p2v[k]) {
						p2v[k] = appConfig.defaultViewName;
					}
				}
			}
			return appConfig;
		},
		setStateListener : function() {
			var self = this;
			MxHistory.setHashListener(function(hash) {
				console.log(hash);
				self.route(hash);
			});
		},
		parseState : function(stateString) {
			//todo:html5 pushState
			return this._parseHash(stateString);
		},
		_parseHash : function(hashQuery) {
			var hash = {}, tmpArr, paraStr, kv;
			hash.pathName = this.appConfig.indexPath;
			hash.paraObj = {};
			hash.referrer = (this.state && this.state.query) || null;
			hash.query = hashQuery;
			if(hashQuery) {
				tmpArr = hashQuery.split("/");
				paraStr = tmpArr.pop();
				hash.pathName = tmpArr.join("/");
				hash.paraObj = Base.unParam(paraStr);
			}
			return hash;
		},
		parseSearch : function() {
			//todo:html5 pushState
			return this._parseSearch();
		},
		_parseSearch : function() {
			var search = {}, prefix = this.config.pathPrefix || null;
			search.pathName = location.pathname;
			search.paraObj = {};
			if(prefix) {
				search.pathName = location.pathname.split(prefix)[1];
			}
			search.query = search.pathName + location.search;
			if(location.search) {
				search.paraObj = Base.unParam(location.search.substr(1));
			}
			return search;
		},
		getRootViewName : function() {
			var p2v = this.appConfig.pathViewMap, viewName;
			if(p2v[this.query.pathname]) {
				viewName = p2v[this.query.pathname];
			} else {
				viewName = p2v[this.appConfig.notFoundPath];
			}
			if(this.query.__view__) {
				viewName = this.query.__view__.split("-").join("/");
			}
			//multipage
			if(this.config.multipage) {
				var schPath = p2v[this.query["sch:pathname"]];
				if( typeof schPath == "object") {
					viewName = schPath[this.query.pathname] || schPath[this.appConfig.notFoundPath];
				} else {
					document.body.id = "vc-root";
					viewName = schPath || this.appConfig.defaultRootViewName;
				}
				console.log("multipage viewname: " + viewName);
			}
			return viewName;
		},
		createQueryModel : function() {
			return new Model(this.query);
		},
		changeQueryModel : function() {
			this._fixQueryModel(this.query);
			this.queryModel.set(this.query);
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
		mountRootView : function() {
			var self = this;
			VOM.root.mountView(this.rootViewName, {
				queryModel : self.queryModel
			});
		}
	};
	return iRouter;
});
