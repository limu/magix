define(function(require, exports, module){
    var Backbone = require("backbone");
    var vom = require("./vom");
    var _ = require("underscore");
    var ctrl = require("./controller");
    var helper = require("./helper");
    var Mustache = require("libs/magix/mu");
    var MxView = Backbone.View.extend({
        initialize: function(o){
            var self = this;
            this.subViewsChange = [];
            this.options = o;
            this.vcid = o.vcid;
            this.queryModel = o.queryModel;
            this.viewName = o.viewName;
            this.bind("rendered", function(){
                this.trigger("beforeSubviewsRender");
                var vc = vom.getElementById(this.vcid);
                var childVcs = vc.getElements();
                var i, child;
                for (i = 0; i < childVcs.length; i++) {
                    child = vom.createElement(childVcs[i]);
                    vc.appendChild(child);
                    child.mountView(child.getAttribute("view_name"), {
                        queryModel: this.queryModel
                    });
                }
            });
            var vc = vom.getElementById(this.vcid);
            if (vc == vom.root) {
                this.queryModel.bind("change", function(){
                    console.log("QM CHANG: Root View Query change " + self.viewName);
                    var res = self.queryModelChange(this);
                    self._changeChain(res, this);
                });
            }
            if (this.init) {
                this.init();
            }
            this.getTemplate(function(data){
                self.template = data;
                var autoRendered = self.render();
                if (autoRendered !== false) {
                    self.trigger("rendered");
                }
            });
            
        },
        _queryModelChange: function(model){
            console.log("QM CHANG: Sub View Query change" + this.viewName);
            var res = this.queryModelChange(model);
            this._changeChain(res, model);
        },
        _changeChain: function(res, model){
            var vcs = [], i;
            var vc = vom.getElementById(this.vcid);
            if (res === false) {
                return;
            }
            if (res === true || res === undefined) {
                vcs = vc.childNodes;
            }
            else 
                if (_.isArray(res)) {
                    vcs = res;
                }
            for (i = 0; i < vcs.length; i++) {
                if (vcs[i].view) {
                    vcs[i].view._queryModelChange(model);
                }
            }
        },
        queryModelChange: function(){
        
        },
        render: function(){
            var node = document.getElementById(this.vcid);
            node.innerHTML = Mustache.to_html(this.template, this.queryModel.toJSON());
            this.rendered = true;
        },
        refresh: function(){
        
        },
        getTemplate: function(cb, name){
            var url = ctrl.env.appHome + this.viewName;
            if (name) {
                url = url + "." + "name" + ".html";
            }
            else {
                url = url + ".html";
            }
            helper.getTemplate(url, function(data){
                cb(data);
            });
        },
        destory: function(){
            var vcQueue, i;
            console.log("VIEW DESTORY:1.begin unmount view @" + this.modUri);
            vcQueue = this.getDestoryQueue();
            console.log("VIEW DESTORY:3.destory vcelement from the end of the queue util this vcelement total " + (vcQueue.length - 1) + " vcelements @" + this.modUri);
            for (i = vcQueue.length - 1; i > 0; i--) {
                vcQueue[i].removeNode();
            }
            console.log("VIEW DESTORY:4.unmount reference vcelement @" + this.modUri);
            var root = vom.getElementById(this.vcid);
            root.unmountView();
            console.log("VIEW DESTORY:5.destory view complete OK!! @" + this.modUri);
        },
        getDestoryQueue: function(){
            var queue = [];
            var root = vom.getElementById(this.vcid);
            
            function rc(e){
                var i;
                queue.push(e);
                for (i = 0; i < e.childNodes.length; i++) {
                    rc(e.childNodes[i]);
                }
            }
            
            rc(root);
            console.log("VIEW DESTORY:2.depth traversal all vcelements @" + this.modUri);
            return queue;
        },
        setData: function(data){
            this.data = data;
            for (var k in data) {
                if (data[k].toJSON) {
                    data[k] = data[k].toJSON();
                }
            }
            data.query = this.queryModel.toJSON();
            this.setRenderer();
        },
        setRenderer: function(){
            var self = this, rr = this.renderer, mcName, wrapperName;
            if (rr) {
                for (mcName in rr) {
                    for (wrapperName in rr[mcName]) {
                        (function(){
                            var mn = mcName, wn = wrapperName;
                            var fn = rr[mn][wn];
                            self.data[mn + "_" + wn] = function(){
                                return fn.call(this, self, mn);
                            };
                        })();
                    }
                }
            }
        },
        delegateEvents: function(){
            var events = this.events;
            var node = document.getElementById(this.el);
            for (var _type in events) {
                (function(){
                    var type = _type;
                    node["on" + type] = function(){
                        var event = arguments[0] || window.event;
                        var target = event.target || event.srcElement;
                        var root = this;
                        if (target.nodeType != 1) {
                            target = target.parentNode;
                        }
                        var eventinfo = target.getAttribute("mx" + type);
                        if (eventinfo) {
                            var events = eventinfo.split("|"), eventArr, eventKey;
                            var vc = vom.getElementById(root.id);
                            var view = vc.view;
                            for (var i = 0; i < events.length; i++) {
                                eventArr = events[i].split(":");
                                eventKey = eventArr.shift();
                                if (view.events && view.events[type] && view.events[type][eventKey]) {
                                    view.events[type][eventKey](view, view.idIt(target), eventArr);
                                }
                            }
                        }
                        target = null;
                        root = null;
                    };
                })();
            }
        },
        idIt: function(node){
            var id = "";
            if (!node.id) {
                node.id = _.uniqueId("mxevt-");
            }
            id = node.id;
            node = null;
            return id;
        }
    });
    return MxView;
});
