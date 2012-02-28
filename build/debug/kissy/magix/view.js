//view
KISSY.add("magix/view",function(S,impl,Base){
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
        
        //this.subViewsChange = []; 不理解的先去掉
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
        /*this.bind("rendered", function() {
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
        });*/
        /*var vf = vom.getElementById(this.vcid);
        if(vf == vom.root) {
            this.queryModel.bind("change", function() {
                
                var res = self.queryModelChange(this);
                self._changeChain(res, this);
            });
        }*/
		if(this.init) {
			setTimeout(function(){//确保内部的magix绑定的事件先执行，再调用init
				self.init();      //如果在init中绑定了事件，无setTimeout时，init中的绑定的事件早于magix中的，有可能出问题
			},0);
        }
		if(!this.preventRender) {
			this.getTemplate(function(data) {
				self.template = data;
				
				setTimeout(function(){//等待init的完成
					var autoRendered = self.render();
					if(autoRendered !== false) {
						self.trigger("rendered");
					}
				},0);
			});
        }
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
       // var vcQueue, i;//, vom = this.getVOMObject();
        
        //vcQueue = this.getDestoryQueue();
        //
        /*for( i = vcQueue.length - 1; i > 0; i--) {
            vcQueue[i].removeNode();
        }*/
        
        //var root = vom.getElementById(this.vcid);
        //root.unmountView();
		if(this.events) {
			var node = document.getElementById(this.vcid);
			for(var eventType in this.events) {
				node["on" + eventType] = null;
			}
			node = null;
		}
        
        this.dispose();
    },
    /*getDestoryQueue : function() {
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
    },*/
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
	getEventInfo:function(event){
		var target = event.target || event.srcElement;
		var mxType='mx'+event.type,evtLevel=this.eventsLevel;
		// check if target is a textnode (safari)
		while(target.nodeType === 3) {
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
		return eventinfo;
	},
	processEvent:function(originEvent){
		var event=originEvent||window.event,
			target=event.target||event.srcElement,
			eventInfo=this.getEventInfo(event);
		if(eventInfo) {
			var events = eventInfo.split("|"), eventArr, eventKey;
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
				if(this.events && this.events[type] && this.events[type][eventKey]) {
					this.events[type][eventKey](this, this.idIt(target), eventArr,event);
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
        var me=this,
			node = document.getElementById(me.vcid);
        for(var _type in events) {
			(function() {
                node["on" + type] = function(e) {
					me.processEvent(e);
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
        
		this.setData({});//确保renderer正确工作，否则在未重写render方法，而又未调用setData时renderer无法正确工作
        node.innerHTML = templet.toHTML({
            template : this.template,
            data : this.data
        });
        this.rendered = true;
    },
    getTemplate : function(cb, name) {
		if(this.template){
			cb(this.template);
			return;
		}
        //var router=this.getRouterObject();
		
        var url = Magix.config.appHome;
		if(/\/app\/$/.test(url))url+=this.viewName.split("app")[1];
		else url+=this.viewName;
        if(name) {
            url = url + "." + "name" + ".html";
        } else {
            url = url + ".html";
        }
		url=url.replace(/([^:\/])\/+/g,'$1\/');//修正多个/紧挨的问题
        var ajax = this.getAjaxObject();
		
		if(Magix.dev||Magix.config.debug)url+='?='+new Date().getTime();
        ajax.getTemplate(url, function(data) {
            
            cb(data);
        }, function(msg) {
			
            cb(msg);
        },this.viewName);
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
},{
	requires:["magix/impls/view","magix/base"]
});