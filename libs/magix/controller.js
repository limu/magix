define(function(require, exports, module){
    var Backbone = require("backbone");
    var _ = require("underscore");
    var config = require("app/config/ini");
    
    var MxController = function(){
        this.initialize();
    };
    
    _.extend(MxController.prototype, Backbone.Event, {
        initialize: function(o){
        
            var p2v = config.pathViewMap, viewName;
            for (var k in p2v) {
                if (!p2v[k]) {
                    p2v[k] = config.defaultViewName;
                }
            }
            this.env = {
                appHome: config.uri.split("app/config/ini")[0],
                templates: {}
            };
            return this;
        },
        _route: function(query){
			
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
        setPostData: function(o){
            this.postData = o;
        },
        navigateTo: function(q){
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
        _goto: function(url){
            location.hash = "!" + url;
        },
        _mountView: function(){
            var self = this;
            var queryObject = this._getQueryObject();
            if (this.viewName == this.oldViewName) {
                this._fixQueryObject(queryObject);
                this.queryModel.set(queryObject);
            }
            else {
                require.async("./vom", function(vom){
                    self.queryModel = new Backbone.Model(queryObject);
                    vom.root.mountView(self.viewName, {
                        queryModel: self.queryModel
                    });
                });
            }
        },
        _fixQueryObject: function(queryObject){
            if (this.queryModel) {
                var k, old = this.queryModel.toJSON();
                for (k in old) {
                    if (!(k in queryObject)) {
                        queryObject[k] = "";
                        //this.queryModel.unset(k);
                    
                    }
                }
            }
        },
        _getQueryObject: function(){
            var queryObject = _.extend(this.paraObj, {
                referrer: this.referrer,
                query: this.query,
                pathname: this.pathName,
                postdata: this.postData || null
            });
            return queryObject;
        },
        _getViewName: function(){
            var p2v = config.pathViewMap, viewName;
            if (p2v[this.pathName]) {
                viewName = p2v[this.pathName];
            }
            else {
                viewName = p2v[config.notFoundPath];
            }
            if (this.paraObj.__view__) {
                viewName = this.paraObj.__view__.split("-").join("/");
            }
            return viewName;
        },
        _fixPathPara: function(query){
            var tmpArr, paraStr, kv;
            if (query) {
                tmpArr = query.split("/");
                paraStr = tmpArr.pop();
                this.pathName = tmpArr.join("/");
                this.paraObj = this.unParam(paraStr);
            }
        },
        unParam: function(s){
            var paraArr = s.split("&");
            var kv, res = {};
            for (var i = 0; i < paraArr.length; i++) {
                kv = paraArr[i].split("=");
                if (kv[0]) {
                    res[kv[0]] = kv[1] || "";
                }
            }
            return res;
        },
        param: function(o){
            var res = [];
            for (var k in o) {
                res.push(k + "=" + o[k]);
            }
            return res.join("&");
        }
    });
    if (!MxController.inst) {
        MxController.inst = new MxController();
    }
    window.MXController = MxController.inst;
    return MxController.inst;
});
