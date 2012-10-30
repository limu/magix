//implement router
KISSY.add("magix/impls/router",function(S,Base,Model,VOM,MVC,appConfig){
	var QueryModel=function(){

	};

	var iRouter = {
		getAppConfig : function() {
			var p2v = appConfig.pathViewMap,
				dViewName=appConfig.defaultViewName;
			if(dViewName && p2v) {
				for(var k in p2v) {
					if(!p2v[k]) {
						p2v[k] = dViewName;
					}
				}
			}
			return appConfig;
		},
		getVOMObject:function(){
			return VOM;
		},
		setStateListener : function() {
			var self = this;
			VOM.__Router=self;
			var router = new MVC.Router();
			router.addRoutes({
				'*hash':function(s){
					self.$busy=true;
					S.log(s.hash);
					self.$lastHash=s.hash;
					self.route(s.hash);
				}
			});
			MVC.Router.start({
				triggerRoute:1,
        		//nativeHistory:1,
        		urlRoot:location.href.split("#")[0].split("index.html")[0]
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
				if(paraStr.indexOf('=')==-1&&paraStr){
					tmpArr.push(paraStr);
					paraStr='';
				}
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
			if(p2v){
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
		navigateTo:function(url){
			var me=this;
			if(me.$busy){
				me.idle(function(){
					me.navigateTo(url);
				});
				return;
			}
			me.$busy=true;

			var np;
			if(Base.isPlainObject(url)){
				np=url;
			}else{
				np = Base.unParam(url);
			}
            var v1 = S.clone(me.state.paraObj);
            delete v1.referrer;
            delete v1.pathname;
            delete v1.query;
            delete v1.postdata;
            var v2 = Base.mix(v1, np);
			for(var p in v2){
				if(!v2[p])delete v2[p];
			}
            var nps = Base.param(v2);
            //var nps = me.param(_.extend(_.clone(me.paraObj),np));
            var newHash=me.state.pathName + "/" + nps;
            if(me.$lastHash==newHash){
            	delete me.$busy;
            	me._runIdleList();
            }else{
	            me.goTo(newHash);
	        }
		}
	};
	return iRouter;
},{
	requires:["magix/base","magix/model","magix/vom","mvc","app/config/ini"]
});