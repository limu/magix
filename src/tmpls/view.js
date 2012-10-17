/*
 * 关于destory和destory
 * backbone中model使用 destroy
 * kissy mvc中model view均使用destroy
 * 建议我们也使用destroy而非destory
 */
View = function() {
    console.log('View->', this);
};
Base.mix(View.prototype, {
    getVOMObject: Base.unimpl,
    getTemplateObject: Base.unimpl,
    getAjaxObject: Base.unimpl,
    //getRouterObject:Base.unimpl,
    /*
     * 当view被destroy时，调用该方法，您可以在该方法内处理实现类中的相关销毁操作
     */
    dispose: Base.unimpl,
    queryModelChange: function() {

    },
    initial: function(o) {
        console.log('View->initialize param-o:', o);
        var self = this,
            vom = this.getVOMObject();
        console.log('view>-initialize vom:', vom);
        //this.subViewsChange = []; 不理解的先去掉
        this.options = o;
        this.vcid = o.vcid;
        this.queryModel = o.queryModel;
        this.viewName = o.viewName;
        this.data = o.data || {};
        if (o.data && !Magix.config.multipage) {
            console.warn("Don't pass data to view directly in single page app!");
        }
        if (o.message && typeof o.message == 'function') {
            this.bind("message", o.message);
        } /***********左莫增加标识符，用来判断当前view是否在vom节点中begin*************/
        this.exist = true;
        //监听unload事件
        this.bind("unload", function() {
            this.exist = false;
        }); /***********左莫增加标识符，用来判断当前view是否在vom节点中end*************/
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
                console.log("QM CHANG: Root View Query change " + self.viewName);
                var res = self.queryModelChange(this);
                self._changeChain(res, this);
            });
        }*/
        if (this.init) {
            setTimeout(function() { //确保内部的magix绑定的事件先执行，再调用init
                if(self.exist){
                    self.init(); //如果在init中绑定了事件，无setTimeout时，init中的绑定的事件早于magix中的，有可能出问题
                }
            }, 0);
        }
        if (!this.preventRender) {
            this.getTemplate(function(data) {
                self.template = data;
                console.log('bf:', self);
                setTimeout(function() { //等待init的完成
                    if (self.exist) {
                        var res=self.render();
                        if(res!==false&&!self.__isStartMountSubs){
                            self.trigger('rendered');
                        }
                        self.__rendered=true;
                        self.trigger("renderComplete",true);
                    }
                }, 0);
            });
        }
    },
    _queryModelChange: function(model) {
        console.log("QM CHANG: Sub View Query change" + this.viewName);
        try{
            if(this.hashHasChanged()){
                var res = this.queryModelChange(model);
            }
        }catch(e){
            console.log(e);
        }
        if(this.__isStartMountSubs)res=false;//如果已经开始渲染子view则不再引发queryModelChange
        this._changeChain(res, model);
    },
    _changeChain: function(res, model) {
        var vcs = [],
            i, vom = this.getVOMObject();
        var vc = vom.getElementById(this.vcid);
        if (res === false) {
            return;
        }
        if (res === true || res === undefined) {
            vcs = vc.childNodes;
        } else if (Base.isArray(res)) {
            vcs = res;
        }
        for (i = 0; i < vcs.length; i++) {
            if (vcs[i].view) {
                vcs[i].view._queryModelChange(model);
            }
        }
    },
    destory: function() {
        console.warn("use destroy instead");
        this.destroy();
    },
    destroy: function() {
        // var vcQueue, i;//, vom = this.getVOMObject();
        console.log("VIEW DESTORY:1.begin unmount view @" + this.modUri);
        //vcQueue = this.getDestoryQueue();
        //console.log("VIEW DESTORY:3.destory vcelement from the end of the queue util this vcelement total " + (vcQueue.length - 1) + " vcelements @" + this.modUri);
/*for( i = vcQueue.length - 1; i > 0; i--) {
            vcQueue[i].removeNode();
        }*/
        console.log("VIEW DESTORY:4.unmount reference vcelement @" + this.modUri);
        //var root = vom.getElementById(this.vcid);
        //root.unmountView();
        if (this.events) {
            var node = document.getElementById(this.vcid);
            for (var eventType in this.events) {
                node["on" + eventType] = null;
            }
            node = null;
        }
        console.log("VIEW DESTORY:5.destory view complete OK!! @" + this.modUri);
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
        console.log("VIEW DESTORY:2.depth traversal all vcelements @" + this.modUri);
        return queue;
    },*/
    setData: function(data) {
        this.data = data;
        for (var k in data) {
            if (data[k]&&data[k].toJSON) {
                data[k] = data[k].toJSON();
            }
        }
        data.query = this.queryModel.toJSON();
        this.setRenderer();
    },
    setRenderer: function() {
        console.log('view->setRenderer this:', this);
        var self = this,
            rr = this.renderer,
            mcName, wrapperName;
        if (rr) {
            for (mcName in rr) {
                for (wrapperName in rr[mcName]) {
                    (function() {
                        var mn = mcName,
                            wn = wrapperName;
                        var fn = rr[mn][wn];
                        self.data[mn + "_" + wn] = function() {
                            return fn.call(this, self, mn);
                        };
                    })();
                }
            }
        }
    },
    getEventInfo: function(event, node) {
        var target = event.target || event.srcElement,
            type = event.type;
        var mxType = 'mx' + type,
            evtLevel = this.eventsLevel;
        // check if target is a textnode (safari)
        while (target.nodeType === 3) {
            target = target.parentNode;
        }
        var eventInfo = target.getAttribute(mxType);

        // 根据evtLevel,回溯target
        if (evtLevel) var typeLv = evtLevel[type];
        if (!eventInfo && typeLv) {
            // 如果evtLevel是数字,逐级向上回溯
            if (!isNaN(typeLv) && typeLv) {
                while (typeLv && target != node) {
                    target = target.parentNode;
                    eventInfo = target.getAttribute(mxType);
                    if (eventInfo) break;
                    typeLv--;
                }
            } else if (typeLv.split('.')[1]) {
                // 如果是className,直接向上寻找有这个className的父级
                typeLv = typeLv.split('.')[1];
                while (target != node) {
                    target = target.parentNode;
                    if (target.className.indexOf(typeLv) >= 0) {
                        eventInfo = target.getAttribute(mxType);
                        break;
                    }
                }
            } else if (typeLv.split('#')[1]) {
                // 如果是id,直接向上寻找有这个id的父级
                typeLv = typeLv.split('#')[1];
                while (target != node) {
                    target = target.parentNode;
                    if (target.id == typeLv) {
                        eventInfo = target.getAttribute(mxType);
                        break;
                    }
                }
            }
        } else if (!eventInfo) {
            // 如果没有设置eventsLevel且没有找到eventinfo, 默认向上寻找一级
            target = target.parentNode;
            eventInfo = target.getAttribute(mxType);
        }
        return {
            info: eventInfo,
            target: target
        };
    },
    processEvent: function(originEvent, parentNode) {
        var event = originEvent || window.event,
            eventInfo = this.getEventInfo(event, parentNode||document.getElementById(this.vcid)),
            type = event.type,
            eventArgs = {},
            target = eventInfo.target,
            info = eventInfo.info,
            eventArgs = {
                target: target,
                originEvent: event
            };
        if (info) {
            var events = info.split("|"),
                eventArr, eventKey;
            for (var i = 0; i < events.length; i++) {
                eventArr = events[i].split(":");
                eventKey = eventArr.shift();

                // 事件代理,通过最后一个参数,决定是否阻止事件冒泡和取消默认动作
                var evtBehavior = eventArr[eventArr.length - 1],
                    evtArg = false;
                if (evtBehavior == '_halt_' || evtBehavior == '_preventDefault_') {
                    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                    eventArgs.isPreventDefault = true;
                    evtArg = true;
                }
                if (evtBehavior == '_halt_' || evtBehavior == '_stop_') {
                    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
                    eventArgs.isStopPropagation = true;
                    evtArg = true;
                }
                if (evtArg) {
                    eventArr.pop();
                }
                this.trigger('beforeEventCall', eventArgs);
                if (this.events && this.events[type] && this.events[type][eventKey]) {
                    this.events[type][eventKey](this, this.idIt(target), eventArr, event);
                }
            }
        }
        this.trigger('delegateEventsFire', eventArgs);
    },
    /**
     * 所有事件处理函数
     * TODO:细化方法使用
     * @property events
     */
    delegateEvents: function() {
        var me = this,
            node = document.getElementById(me.vcid),
            events = this.events;
        for (var type in events) {
            node["on" + type] = function(e) {
                me.processEvent(e, node);
            };
        }
    },
    setViewHTML:function(html){
        var me=this;
        if(me.exist){
            me.trigger("beforeRebuild",true);
            me.trigger("prerender");
            document.getElementById(me.vcid).innerHTML=html;
            me.trigger("rendered");
            me.__isStartMountSubs=true;
            setTimeout(function(){delete me.__isStartMountSubs},0);
            return true;
        }
        return false;
    },
    render: function() {
       /* if (this.preventRender) {
            this.rendered = true;
            return true;
        }
        console.log('view->render', this, this.getTemplateObject());
        var node = document.getElementById(this.vcid),
            templet = this.getTemplateObject();
        console.log('view->render,node & template:', node, templet);
        this.setData({}); //确保renderer正确工作，否则在未重写render方法，而又未调用setData时renderer无法正确工作
        node.innerHTML = templet.toHTML({
            template: this.template,
            data: this.data
        });
        this.rendered = true;*/
    },
    getTemplate: function(cb, name) {
        if (this.template) {
            cb(this.template);
            return;
        }
        //var router=this.getRouterObject();
        console.log("view->getTemplate viewName:", this.viewName);
        var url = Magix.config.appHome;
        if (/\/app\/$/.test(url)) url += this.viewName.split("app")[1];
        else url += this.viewName;
        if (name) {
            url = url + "." + "name" + ".html";
        } else {
            url = url + ".html";
        }
        url = url.replace(/([^:\/])\/+/g, '$1\/'); //修正多个/紧挨的问题
        //url = url.replace(/\.html([\W])?/,Magix.config.release?'_c.html$1':'.source.html$1');
        var ajax = this.getAjaxObject();
        console.log("view->getTemplate ajax:", ajax);
        if (Magix.dev || !Magix.config.release) url += '?t=' + new Date().getTime();
        ajax.getTemplate(url, function(data) {
            console.log('cb:', data);
            cb(data);
        }, function(msg) {
            console.log('fail', msg);
            cb(msg);
        }, this.viewName);
    },
    idIt: function(node) {
        var id = "";
        if (!node.id) {
            node.id = Base.uniqueId("mxevt-");
        }
        id = node.id;
        node = null;
        return id;
    },
    receiveMessage:function(e){

    },
    hashChange:function(e){

    },
    _hashChange:function(qm){
        var me=this;
        if(!me.__isStartMountSubs){
            if(me.hashHasChanged()){
                me.hashChange(qm);
                me.observeHash();
            }
        }
    },
    _receiveMessage:function(e){
        var me=this;
        try{
            if(me.exist&&me.__rendered){
                me.receiveMessage(e);
            }else{
                me.unbind("renderComplete");
                me.bind('renderComplete',function(){
                    me.receiveMessage(e);
                });
            }
        }catch(e){
            console.error(e);
        }
    },
    postMessageTo:function(key,data){
        var vom=this.getVOMObject();
        if(!Base.isArray(key))key=[key];
        for(var i=0;i<key.length;i++){
            var vframe=vom.get(key[i]);
            if(vframe)vframe.postMessage(data,this);
        }        
    },
    observeHash:function(keys,_ignore){
        var me=this;
        if(keys){
            if(Base.isString(keys)){
                keys=keys.split(',');
            }else if(!Base.isArray(keys)){
                keys=[keys];
            }
            me.$observeHashKeys=keys;//保存当前监控的hash key
            me.$observeHashCache={};//缓存当前hash的值
            for(var i=0;i<keys.length;i++){
                me.$observeHashCache[keys[i]]=me.queryModel.get(keys[i]);
            }
        }else if(!_ignore){//如果未传递key 则使用上次设置的key重新缓存
            me.observeHash(me.$observeHashKeys,true);
        }
    },
    hashHasChanged:function(keys){
        var me=this,
            hashCache=me.$observeHashCache,
            realCache=me.$realUsingCache,
            result;
        if(!keys)keys=me.$observeHashKeys;//如果未传递keys，则使用当初监控时的keys
        if(keys){
            if(Base.isString(keys)){
                keys=keys.split(',');
            }else if(!Base.isArray(keys)){
                keys=[keys];
            }
            if(hashCache){//表示调用过observeHash 
                result=false;
                console.log(keys);
                for(var i=0,k,v;i<keys.length;i++){
                    k=keys[i];
                    if(!hashCache.hasOwnProperty(k)){
                        console.warn(k);
                    }else{
                        v=me.queryModel.get(k);
                        result=hashCache[k]!=v;
                        if(result&&realCache&&realCache.hasOwnProperty(k)){//值有改变，看是否和真实使用中的相同
                            result=realCache[k]!=v;//
                        }
                        if(result){
                            break;
                        }
                    }
                }
                return result;
            }else{//未调用 走queryModel的hasChanged方法
                for(var i=0;i<keys.length;i++){
                    if(me.queryModel.hasChanged(keys[i])){
                        return true;
                    }
                }
                return false;
            }
        }
        return true;
    },
    hashHasChangedExcept:function(keys){
        var tempKeys=[],
            tempObj={},
            me=this,
            obsKeys=me.$observeHashKeys;
        if(keys&&obsKeys){
            if(Base.isString(keys)){
                keys=keys.split(',');
            }else if(!Base.isArray(keys)){
                keys=[keys];
            }
            for(var i=0;i<keys.length;i++){
                tempObj[keys[i]]=1;
            }
            for(var i=0;i<obsKeys.length;i++){
                if(!tempObj[obsKeys[i]]){
                    tempKeys.push(obsKeys[i]);
                }
            }
        }else{
            tempKeys=obsKeys;
        }
        return me.hashHasChanged(tempKeys);
    },
    hashRealUsing:function(obj){
        var me=this;
        if(obj){//设置hash对应的真实使用的值
            if(!me.$realUsingCache)me.$realUsingCache={};
            for(var p in obj){
                me.$realUsingCache[p]=obj[p];
            }
        }
    }
});
