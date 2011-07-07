/**
 * Magix View 模块
 * @module view
 * @requires backbone,underscore,libs/magix/vom,libs.magix/controller,libs/magix/helper,libs/magix/mu
 */
/**
 * Magix View基类.继承自Backbone.View.用于管理View声明周期,事件代理,渲染数据,以及响应Hash变化.<br/>
 * MagixView子类位于app/views目录之下,通过重写init,render,queryModelChange,renderer,events来扩展出具体子类,如:<br/>
 * define(function(){<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;require("libs/magix/view").extend({init:...,render:...});<br/>
 * }<br/>
 * 通常不会直接通过new View(config)来创建类的实例,而是通过vcElement.mountView("viewName")的方式将view装载入一个容器(<a href="module_vcelement.html">vcelement</a>)时进行实例化.
 * @class View
 * @param {Object} config config其中必须包含viewName,vcid和queryModel三项,指明view的名字,展示view的容器id和当前的query
 * @constructor 
 */
define(function(require, exports, module){
    var Backbone = require("backbone");
    var vom = require("./vom");
    var _ = require("underscore");
    var ctrl = require("./controller");
    var helper = require("./helper");
    var Mustache = require("libs/magix/mu");
    var MxView = Backbone.View.extend({
		/**
		 * 实例化过程会调用init方法,在这个方法中可以完成一些初始化任务,比如载入将要使用的Model/Collection对象
		 * @method init
		 */
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
		/**
		 * query发生变化事件响应函数,基类中是个空方法,各子类在需要时实现这个方法<br/>
		 * 注意,并非query发生变化一定会触发这个方法,需要由父View决定是否将change事件下发给子View.<br/>
		 * 相应的return true将会下发change事件给子view,false反之,return vcid数组,将事件传递给指定的子View.
		 * @method queryModelChange
		 * @return {Boolean|Array}
		 */
        queryModelChange: function(){
        
        },
		/**
		 * view渲染方法,各子类可以覆盖<br/>
		 * 默认会将query交给同名的模板文件,渲染至vcelement内.
		 * @method render
		 */
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
		/**
		 * 设置数据到this.data,内部会自动把renderer附加到data中<br/>
		 * mustahce.tohtml(template,this.setData({list:...}));
		 * @method setData
		 */
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
		/**
		 * 为复杂数据渲染构建renderer<br/>
		 * TODO:细化方法使用
		 * @property renderer
		 */
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
		/**
		 * 所有事件处理函数
		 * TODO:细化方法使用
		 * @property events
		 */
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
