define("magix/view", ["magix/impls/view","magix/base"], function(require, exports, module) {
	var impl = require("magix/impls/view");
	var Base=require("magix/base");
	var View;
	/*
 * 关于destory和destory
 * backbone中model使用 destroy
 * kissy mvc中model view均使用destroy
 * 建议我们也使用destroy而非destory
 */
View = function() {
    
};
Base.mix(View.prototype, {
    render : Base.unimpl,
    getTemplate : Base.unimpl,
    getVOMObject : Base.unimpl,
    getTemplateObject : Base.unimpl,
    getAjaxObject : Base.unimpl,
    //getRouterObject:Base.unimpl,
    /*
     * 当view被destroy时，调用该方法，您可以在该方法内处理实现类中的相关销毁操作
     */
    dispose : Base.unimpl,
    queryModelChange : function() {

    },
    refresh : function() {

    },
    initial : function(o) {
        
        var self = this, vom = this.getVOMObject();
        
        this.subViewsChange = [];
        this.options = o;
        this.vcid = o.vcid;
        this.queryModel = o.queryModel;
        this.viewName = o.viewName;
        this.data = o.data || {};
        if(o.data && !Magix.config.multipage) {
            
        }
        if(o.message && typeof o.message == 'function') {
            this.bind("message", o.message);
        }
        /***********左莫增加标识符，用来判断当前view是否在vom节点中begin*************/
        this.exist = true;
        //监听unload事件
        this.bind("unload", function() {
            this.exist = false;
        });
        /***********左莫增加标识符，用来判断当前view是否在vom节点中end*************/
        this.bind("rendered", function() {
            this.trigger("beforeSubviewsRender");
            var vc = vom.getElementById(this.vcid);
            var childVcs = vc.getElements();
            var i, child;
            for( i = 0; i < childVcs.length; i++) {
                child = vom.createElement(childVcs[i]);
                vc.appendChild(child);
                child.mountView(child.getAttribute("view_name"), {
                    queryModel : this.queryModel
                });
            }
        });
        var vc = vom.getElementById(this.vcid);
        if(vc == vom.root) {
            this.queryModel.bind("change", function() {
                
                var res = self.queryModelChange(this);
                self._changeChain(res, this);
            });
        }
        if(this.init) {
            this.init();
        }
        this.getTemplate(function(data) {
            self.template = data;
            
            var autoRendered = self.render();
            if(autoRendered !== false) {
                self.trigger("rendered");
            }
        });
    },
    _queryModelChange : function(model) {
        
        var res = this.queryModelChange(model);
        this._changeChain(res, model);
    },
    _changeChain : function(res, model) {
        var vcs = [], i, vom = this.getVOMObject();
        var vc = vom.getElementById(this.vcid);
        if(res === false) {
            return;
        }
        if(res === true || res === undefined) {
            vcs = vc.childNodes;
        } else if(Base.isArray(res)) {
            vcs = res;
        }
        for( i = 0; i < vcs.length; i++) {
            if(vcs[i].view) {
                vcs[i].view._queryModelChange(model);
            }
        }
    },
    destory : function() {
        
        this.destroy();
    },
    destroy : function() {
        var vcQueue, i, vom = this.getVOMObject();
        
        vcQueue = this.getDestoryQueue();
        
        for( i = vcQueue.length - 1; i > 0; i--) {
            vcQueue[i].removeNode();
        }
        
        var root = vom.getElementById(this.vcid);
        root.unmountView();
        
        this.dispose();
    },
    getDestoryQueue : function() {
        var queue = [], vom = this.getVOMObject();
        var root = vom.getElementById(this.vcid);

        function rc(e) {
            var i;
            queue.push(e);
            for( i = 0; i < e.childNodes.length; i++) {
                rc(e.childNodes[i]);
            }
        }

        rc(root);
        
        return queue;
    },
    setData : function(data) {
        this.data = data;
        for(var k in data) {
            if(data[k].toJSON) {
                data[k] = data[k].toJSON();
            }
        }
        data.query = this.queryModel.toJSON();
        this.setRenderer();
    },
    setRenderer : function() {
        var self = this, rr = this.renderer, mcName, wrapperName;
        if(rr) {
            for(mcName in rr) {
                for(wrapperName in rr[mcName]) {(function() {
                        var mn = mcName, wn = wrapperName;
                        var fn = rr[mn][wn];
                        self.data[mn + "_" + wn] = function() {
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
    delegateEvents : function() {
        var events = this.events, evtLevel = this.eventsLevel;
		var vom=this.getVOMObject();
        var node = document.getElementById(this.options.vcid);
        for(var _type in events) {(function() {
                var type = _type, mxType = 'mx' + type;

                node["on" + type] = function() {
                    var event = arguments[0] || window.event;
                    var target = event.target || event.srcElement;
                    var root = this;
                    // check if target is a textnode (safari)
                    if(target.nodeType === 3) {
                        target = target.parentNode;
                    }
                    var eventinfo = target.getAttribute(mxType);

                    // 根据evtLevel,回溯target
                    if(evtLevel)
                        var typeLv = evtLevel[type];
                    if(!eventinfo && typeLv) {
                        // 如果evtLevel是数字,逐级向上回溯
                        if(!isNaN(typeLv) && typeLv) {
                            while(typeLv && target != node) {
                                target = target.parentNode;
                                eventinfo = target.getAttribute(mxType);
                                if(eventinfo)
                                    break;
                                typeLv--;
                            }
                        } else if(typeLv.split('.')[1]) {
                            // 如果是className,直接向上寻找有这个className的父级
                            typeLv = typeLv.split('.')[1];
                            while(target != node) {
                                target = target.parentNode;
                                if(target.className.indexOf(typeLv) >= 0) {
                                    eventinfo = target.getAttribute(mxType);
                                    break;
                                }
                            }
                        } else if(typeLv.split('#')[1]) {
                            // 如果是id,直接向上寻找有这个id的父级
                            typeLv = typeLv.split('#')[1];
                            while(target != node) {
                                target = target.parentNode;
                                if(target.id == typeLv) {
                                    eventinfo = target.getAttribute(mxType);
                                    break;
                                }
                            }
                        }
                    } else if(!eventinfo) {
                        // 如果没有设置eventsLevel且没有找到eventinfo, 默认向上寻找一级
                        target = target.parentNode;
                        eventinfo = target.getAttribute(mxType);
                    }

                    if(eventinfo) {
                        var events = eventinfo.split("|"), eventArr, eventKey;
                        var vc = vom.getElementById(root.id);
                        var view = vc.view;
                        for(var i = 0; i < events.length; i++) {
                            eventArr = events[i].split(":");
                            eventKey = eventArr.shift();

                            // 事件代理,通过最后一个参数,决定是否阻止事件冒泡和取消默认动作
                            var evtBehavior = eventArr[eventArr.length - 1], evtArg = false;
                            if(evtBehavior == '_halt_' || evtBehavior == '_preventDefault_') {
                                event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                                evtArg = true;
                            }
                            if(evtBehavior == '_halt_' || evtBehavior == '_stop_') {
                                event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
                                evtArg = true;
                            }
                            if(evtArg) {
                                eventArr.pop();
                            }
                            if(view.events && view.events[type] && view.events[type][eventKey]) {
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
    render : function() {
        if(this.preventRender) {
            this.rendered = true;
            return true;
        }
        
        var node = document.getElementById(this.vcid), templet = this.getTemplateObject();
        
        node.innerHTML = templet.toHTML({
            template : this.template,
            data : {
                data : this.data,
                queryModel : this.queryModel.toJSON()
            }
        });
        this.rendered = true;
    },
    getTemplate : function(cb, name) {
        if(this.preventRender) {
            cb();
            return;
        }
        //var router=this.getRouterObject();
        var url = Magix.config.appHome + this.viewName.split("app")[1];
        if(name) {
            url = url + "." + "name" + ".html";
        } else {
            url = url + ".html";
        }
        var ajax = this.getAjaxObject();
        ajax.getTemplate(url, function(data) {
            
            cb(data);
        }, function(msg) {
            cb(msg);
        });
    },
    idIt : function(node) {
        var id = "";
        if(!node.id) {
            node.id = Base.uniqueId("mxevt-");
        }
        id = node.id;
        node = null;
        return id;
    }
});

	return Base.implement(View,impl);
});