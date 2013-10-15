/**
 * @fileOverview Vframe类
 * @author 行列
 * @version 1.0
 */
define('magix/vframe', ["magix/magix", "magix/event", "magix/view"], function(Magix, Event, BaseView) {
    var D = document;
var VframeIdCounter = 1 << 16;

var SafeExec = Magix.safeExec;
var Slice = [].slice;


var Mix = Magix.mix;

var TagName = Magix.config('tagName');
var RootId = Magix.config('rootId');
var IsDefaultTagName = !Magix.config('tagNameChanged');
var Has = Magix.has;
var MxView = 'mx-view';
var MxBuild = IsDefaultTagName ? 'mx-defer' : 'mx-vframe';

var Alter = 'alter';
var Created = 'created';
var RootVframe;
var GlobalAlter;

var $ = function(id) {
    return typeof id == 'object' ? id : D.getElementById(id);
};
var $$ = function(id, tag, node) {
    node = $(id);
    return node ? node.getElementsByTagName(tag) : [];
};

var IdIt = function(dom) {
    return dom.id || (dom.id = 'magix_vf_' + (VframeIdCounter--));
};

var NodeIn = function(a, b, r) {
    a = $(a);
    b = $(b);
    if (a && b) {
        if (a !== b) {
            try {
                r = b.contains ? b.contains(a) : b.compareDocumentPosition(a) & 16;
            } catch (e) {
                r = 0;
            }
        } else {
            r = 1;
        }
    }
    return r;
};
var ScriptsReg = /<script[^>]*>[\s\S]*?<\/script>/ig;
var RefLoc;
/**
 * Vframe类
 * @name Vframe
 * @class
 * @constructor
 * @borrows Event.on as this.on
 * @borrows Event.fire as this.fire
 * @borrows Event.un as this.un
 * @param {String} id vframe id
 * @property {String} id vframe id
 * @property {View} view view对象
 * @property {VOM} owner VOM对象
 * @property {Boolean} viewInited view是否完成初始化，即view的inited事件有没有派发
 * @property {String} pId 父vframe的id，如果是根节点则为undefined
 */
var Vframe = function(id) {
    var me = this;
    me.id = id;
    //me.vId=id+'_v';
    me.cM = {};
    me.cC = 0;
    me.rC = 0;
    me.sign = 1 << 30;
    me.rM = {};
};

Mix(Vframe, {
    /**
     * @lends Vframe
     */
    /**
     * 获取根vframe
     * @param {VOM} vom vom对象
     * @return {Vframe}
     * @private
     */
    root: function(owner, refLoc) {
        if (!RootVframe) {
            RefLoc = refLoc;
            var e = $(RootId);
            if (!e) {
                e = D.createElement(TagName);
                e.id = RootId;
                D.body.insertBefore(e, D.body.firstChild);
            }
            RootVframe = new Vframe(RootId);
            owner.add(RootVframe);
        }
        return RootVframe;
    }
});
/*
    修正IE下标签问题
    @2012.11.23
    暂时先不修正，如果页面上有vframe标签先create一下好了，用这么多代码代替一个document.createElement('vframe')太不值得
 */
/*(function(){
    var badVframes=$$(D,'/'+Vframe.tagName);
    var temp=[];
    for(var i=0,j=badVframes.length;i<j;i++){
        temp.push(badVframes[i]);
    }
    badVframes=temp;
    for(var i=0,j=badVframes.length;i<j;i++){
        var bVf=badVframes[i];
        var pv=bVf.previousSibling;
        var rVf=$C(Vframe.tagName);
        var pNode=pv.parentNode;
        var anchorNode=bVf.nextSibling;
        var vframeId;
        var vframeViewName;
        pNode.removeChild(bVf);
        temp=[];
        while(pv){
            if(pv.tagName&&pv.tagName.toLowerCase()==Vframe.tagName){
                vframeId=pv.id;
                vframeViewName=pv.getAttribute(MxView);
                pNode.removeChild(pv);
                break;
            }else{
                temp.push(pv);
                pv=pv.previousSibling;
            }
        }
        while(temp.length){
            rVf.appendChild(temp.pop());
        }
        pNode.insertBefore(rVf,anchorNode);
        if(vframeId){
            rVf.id=vframeId;
        }
        if(vframeViewName){
            rVf.setAttribute(MxView,vframeViewName);
        }
    }
}());*/
//

Mix(Mix(Vframe.prototype, Event), {
    /**
     * @lends Vframe#
     */
    /**
     * 是否启用场景转场动画，相关的动画并未在该类中实现，如需动画，需要mxext/vfanim扩展来实现，设计为方法而不是属性可方便针对某些vframe使用动画
     * @return {Boolean}
     * @default false
     * @function
     */
    //useAnimUpdate:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，旧的view销毁时调用
     * @function
     */
    //oldViewDestroy:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，为新view准备好填充的容器
     * @function
     */
    //prepareNextView:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，新的view创建完成时调用
     * @function
     */
    //newViewCreated:Magix.noop,
    /**
     * 加载对应的view
     * @param {String} viewPath 形如:app/views/home?type=1&page=2 这样的名称
     * @param {Object|Null} viewInitParams view在调用init时传递的参数
     * @param {Function} callback view加载完成并触发inited事件时的回调
     */
    mountView: function(viewPath, viewInitParams, callback) {
        var me = this;
        var node = $(me.id);
        if (!node._bak) {
            node._bak = 1;
            node._tmpl = node.innerHTML.replace(ScriptsReg, '');
        } else {
            node._chgd = 1;
        }
        //var useTurnaround=me.viewInited&&me.useAnimUpdate();
        me.unmountView();
        if (viewPath) {
            var path = Magix.pathToObject(viewPath);
            var vn = path.pathname;
            var sign = --me.sign;
            Magix.libRequire(vn, function(View) {
                if (sign == me.sign) { //有可能在view载入后，vframe已经卸载了
                    var vom = me.owner;
                    BaseView.prepare(View);

                    /*var vId;
                    if(useTurnaround){
                        vId=me.vId;
                        me.prepareNextView();
                    }else{
                        vId=me.id;
                    }*/
                    var view = new View({
                        owner: me,
                        id: me.id,
                        $: $,
                        path: vn,
                        vom: vom,
                        //vId:me.vId,
                        //vfId:me.id,
                        location: RefLoc
                    });
                    me.view = view;
                    view.on('interact', function(e) { //view准备好后触发
                        /*
                            Q:为什么在interact中就进行动画，而不是在rendered之后？
                            A:可交互事件发生后，到渲染出来view的界面还是有些时间的，但这段时间可长可短，比如view所需要的数据都在内存中，则整个过程就是同步的，渲染会很快，也有可能每次数据都从服务器拉取（假设时间非常长），这时候渲染显示肯定会慢，如果到rendered后才进行动画，就会有相当长的一个时间停留在前一个view上，无法让用户感觉到程序在运行。通常这时候的另外一个解决办法是，切换到拉取时间较长的view时，这个view会整一个loading动画，也就是保证每个view及时的显示交互或状态内容，这样动画在做转场时，从上一个view转到下一个view时都会有内容，即使下一个view没内容也能及时的显示出白板页面，跟无动画时是一样的，所以这个点是最好的一个触发点
                         */
                        /*if(useTurnaround){
                            me.newViewCreated(1);
                        }
                        */
                        if (!e.tmpl) {

                            if (node._chgd) {
                                node.innerHTML = node._tmpl;
                            }

                            me.mountZoneVframes(0, 0, 1);
                        }
                        view.on('rendered', function() { //再绑定rendered
                            //
                            me.mountZoneVframes(0, 0, 1);
                        });
                        view.on('prerender', function() {
                            if (!me.unmountZoneVframes(0, 1)) {
                                me.cAlter();
                            }
                        });

                        view.on('inited', function() {
                            me.viewInited = 1;
                            me.fire('viewInited', {
                                view: view
                            });
                            if (callback) {
                                SafeExec(callback, view, me);
                            }
                        });
                    }, 0);
                    viewInitParams = viewInitParams || {};
                    view.load(Mix(viewInitParams, path.params, viewInitParams));
                }
            });
        }
    },
    /**
     * 销毁对应的view
     */
    unmountView: function() {
        var me = this;
        if (me.view) {
            if (!GlobalAlter) {
                GlobalAlter = {};
            }
            me.unmountZoneVframes(0, 1); //子view中存在!autoMounted的节点
            me.cAlter(GlobalAlter);
            me.view.destroy();
            var node = $(me.id);
            if (node && node._bak) {
                node.innerHTML = node._tmpl;
            }
            /*if(useAnim&&isOutermostView){//在动画启用的情况下才调用相关接口
                me.oldViewDestroy();
            }*/
            delete me.view;
            delete me.viewInited;
            GlobalAlter = 0;
            me.fire('viewUnmounted');

        }
        me.sign--;
    },
    /**
     * 加载vframe
     * @param  {String} id             节点id
     * @param  {String} viewPath       view路径
     * @param  {Object} viewInitParams 传递给view init方法的参数
     * @return {Vframe} vframe对象
     * @example
     * //html
     * <div id="magix_vf_defer"></div>
     * //js
     * view.owner.mountVframe('magix_vf_defer','app/views/list',{page:2})
     * //注意：动态向某个节点渲染view时，该节点无须是vframe标签
     */
    mountVframe: function(id, viewPath, viewInitParams) {
        var me = this;
        var vom = me.owner;
        var vf = vom.get(id);
        if (!vf) {
            vf = new Vframe(id);

            vf.pId = me.id;

            if (!Has(me.cM, id)) {
                me.cC++;
            }
            me.cM[id] = 1;
            vom.add(vf);
        }
        vf.mountView(viewPath, viewInitParams);
        return vf;
    },
    /**
     * 加载当前view下面的子view，因为view的持有对象是vframe，所以是加载vframes
     * @param {zoneId} HTMLElement|String 节点对象或id
     * @param  {Object} viewInitParams 传递给view init方法的参数
     */
    mountZoneVframes: function(zoneId, viewInitParams) {
        var me = this;
        //var owner=me.owner;
        var node = zoneId || me.id;
        me.unmountZoneVframes(node, 1);
        /* if(!zoneId){
            node=me.id;
        }else{
            node=zoneId;
        }*/
        var vframes = $$(node, TagName);
        var count = vframes.length;
        var subs = {};
        if (count) {
            for (var i = 0, vframe, key, mxView, mxBuild; i < count; i++) {
                vframe = vframes[i];

                key = IdIt(vframe);
                if (!Has(subs, key)) {
                    mxView = vframe.getAttribute(MxView);
                    mxBuild = !vframe.getAttribute(MxBuild);
                    mxBuild = mxBuild == IsDefaultTagName;
                    if (mxBuild || mxView) {
                        me.mountVframe(key, mxView, viewInitParams);
                        var svs = $$(vframe, TagName);
                        for (var j = 0, c = svs.length, temp; j < c; j++) {
                            temp = svs[j];
                            mxView = temp.getAttribute(MxView);
                            mxBuild = !temp.getAttribute(MxBuild);
                            mxBuild = mxBuild == IsDefaultTagName;
                            if (!mxBuild && !mxView) {
                                subs[IdIt(temp)] = 1;
                            }
                        }
                    }
                }
            }
        }
        //if (me.cC == me.rC) { //有可能在渲染某个vframe时，里面有n个vframes，但立即调用了mountZoneVframes，这个下面没有vframes，所以要等待
        me.cCreated();
        //}
    },
    /**
     * 销毁vframe
     * @param  {String} [id]      节点id
     */
    unmountVframe: function(id, inner) { //inner 标识是否是由内部调用，外部不应该传递该参数
        var me = this;
        id = id || me.id;
        var vom = me.owner;
        var vf = vom.get(id);
        if (vf) {
            var fcc = vf.fcc;
            vf.unmountView();
            vom.remove(id, fcc);
            me.fire('destroy');
            var p = vom.get(vf.pId);
            if (p && Has(p.cM, id)) {
                delete p.cM[id];
                p.cC--;
                if (!inner) {
                    p.cCreated();
                }
            }
        }
    },
    /**
     * 销毁某个区域下面的所有子vframes
     * @param {HTMLElement|String} [zoneId]节点对象或id
     */
    unmountZoneVframes: function(zoneId, inner) {
        var me = this;
        var children;
        var hasVframe;
        var p;
        if (zoneId) {
            var cm = me.cM;
            var ids = {};
            for (p in cm) {
                if (NodeIn(p, zoneId)) {
                    ids[p] = 1;
                }
            }
            children = ids;
        } else {
            children = me.cM;
        }
        for (p in children) {
            hasVframe = 1;
            me.unmountVframe(p, 1);
        }
        if (!inner) {
            me.cCreated();
        }
        return hasVframe;
    },
    /**
     * 调用view中的方法
     * @param  {String} methodName 方法名
     * @param {Object} [args1,args2] 向方法传递的参数
     * @return {Object}
     */
    invokeView: function(methodName) {
        var me = this;
        var view = me.view;
        var args = Slice.call(arguments, 1);
        var r;
        if (me.viewInited && view[methodName]) {
            r = SafeExec(view[methodName], args, view);
        }
        return r;
    },
    /**
     * 通知所有的子view创建完成
     * @private
     */
    cCreated: function(e) {
        var me = this;
        if (me.cC == me.rC) {
            var view = me.view;
            if (view && !me.fcc) {
                me.fcc = 1;
                delete me.fca;
                view.fire(Created, e);
                me.fire(Created, e);
            }
            var vom = me.owner;
            vom.vfCreated();

            var mId = me.id;
            var p = vom.get(me.pId);
            if (p && !Has(p.rM, mId)) {

                p.rM[mId] = p.cM[mId];
                p.rC++;
                p.cCreated(e);

            }
        }
    },
    /**
     * 通知子vframe有变化
     * @private
     */
    cAlter: function(e) {
        var me = this;
        if (!e) e = {};
        delete me.fcc;
        if (!me.fca) {
            var view = me.view;
            var mId = me.id;
            if (view) {
                me.fca = 1;
                view.fire(Alter, e);
                me.fire(Alter, e);
            }
            var vom = me.owner;
            var p = vom.get(me.pId);


            if (p && Has(p.rM, mId)) {
                p.rC--;
                delete p.rM[mId];
                p.cAlter(e);
            }
        }
    },
    /**
     * 通知当前vframe，地址栏发生变化
     * @param {Object} loc window.location.href解析出来的对象
     * @param {Object} chged 包含有哪些变化的对象
     * @private
     */
    locChged: function(loc, chged) {
        var me = this;
        var view = me.view;
        /*
            重点：
                所有手动mountView的都应该在合适的地方中断消息传递：
            示例：
                <div id="magix_vf_root">
                    <vframe mx-view="app/views/leftmenus" id="magix_vf_lm"></vframe>
                    <vframe id="magix_vf_main"></vframe>
                </div>
            默认view中自动渲染左侧菜单，右侧手动渲染

            考虑右侧vframe嵌套并且缓存的情况下，如果未中断消息传递，有可能造成新渲染的view接收到消息后不能做出正确反映，当然左侧菜单是不需要中断的，此时我们在locationChange中
              return ["magix_vf_lm"];

            假设右侧要这样渲染：
                <vframe mx-view="app/views/home/a" id="vf1"></vframe>

            接收消息渲染main时：
                locChanged(先通知main有loc变化，此时已经知道main下面有vf1了)
                    |
                mountMainView(渲染main)
                    |
                unmountMainView(清除以前渲染的)
                    |
                unmountVf1View(清除vf1)
                    |
                mountVf1View(main渲染完成后渲染vf1)
                    |
                locChangedToA(继续上面的循环到Vf1)

                error;
            方案：
                0.3版本中采取的是在mount某个view时，先做销毁时，直接把下面的子view递归出来，一次性销毁，但依然有问题，销毁完，再渲染，此时消息还要向后走（看了0.3的源码，这块理解的并不正确）

                0.3把块放在view中了，在vom中取出vframe，但这块的职责应该在vframe中做才对，view只管显示，vframe负责父子关系
         */
        if (view && view.sign > 0) {
            //view.location=loc;
            if (view.rendered) { //存在view时才进行广播，对于加载中的可在加载完成后通过调用view.location拿到对应的window.location.href对象，对于销毁的也不需要广播
                var isChanged = view.olChanged(chged);
                /**
                 * 事件对象
                 * @type {Object}
                 * @ignore
                 */
                var args = {
                    location: loc,
                    changed: chged,
                    /**
                     * 阻止向所有的子view传递
                     * @ignore
                     */
                    prevent: function() {
                        this.cs = [];
                    },
                    /**
                     * 向特定的子view传递
                     * @param  {Array} c 子view数组
                     * @ignore
                     */
                    toChildren: function(c) {
                        c = c || [];
                        if (Magix.isString(c)) {
                            c = c.split(',');
                        }
                        this.cs = c;
                    }
                };
                if (isChanged) { //检测view所关注的相应的参数是否发生了变化
                    //safeExec(view.render,[],view);//如果关注的参数有变化，默认调用render方法
                    //否定了这个想法，有时关注的参数有变化，不一定需要调用render方法
                    SafeExec(view.locationChange, args, view);
                }
                var cs = args.cs || Magix.keys(me.cM);
                //
                for (var i = 0, j = cs.length, vom = me.owner, vf; i < j; i++) {
                    vf = vom.get(cs[i]);
                    if (vf) {
                        vf.locChged(loc, chged);
                    }
                }
            }
        }
    }
    /**
     * 向当前vframe发送消息
     * @param {Object} args 消息对象
     */
    /*message:function(args){
        var me=this;
        var view=me.view;
        if(view&&me.vced){*/
    //表明属于vframe的view对象已经加载完成
    /*
                考虑
                <vframe id="v1" mx-view="..."></vframe>
                <vframe id="v2" mx-view="..."></vframe>
                <vframe id="v3" mx-view="..."></vframe>

                v1渲染后postMessage向v2 v3发消息，此时v2 v3的view对象是构建好了，但它对应的模板可能并未就绪，需要等待到view创建完成后再发消息过去
             */
    //if(view.rendered){
    //safeExec(view.receiveMessage,args,view);
    /*}else{ //使用ViewLoad
                view.on('created',function(){
                    safeExec(this.receiveMessage,args,this);
                });
            }   */
    //}else{//经过上面的判断，到这一步说明开始加载view但尚未加载完成
    /*
                Q:当vframe没有view属性但有viewName表明属于这个vframe的view异步加载尚未完成，但为什么还要向这个view发送消息呢，丢弃不可以吗？

                A:考虑这样的情况，页面上有A B两个view，A在拿到数据完成渲染后会向B发送一个消息，B收到消息后才渲染。在加载A B两个view时，是同时加载的，这两个加载是异步，A在加载、渲染完成向B发送消息时，B view对应的js文件很有可能尚未载入完成，所以这个消息会由B vframe先持有，等B对应的view载入后再传递这个消息过去。如果不传递这个消息则Bview无法完成后续的渲染。vframe是通过对内容分析立即就构建出来的，view是对应的js加载完成才存在的，因异步的存在，所以需要这样的处理。
             */
    /*
            me.on(ViewLoad,function(e){
                safeExec(e.view.receiveMessage,args,e.view);
            });
        }
    }*/
    /**
     * view初始化完成后触发，由于vframe可以渲染不同的view，也就是可以通过mountView来渲染其它view，所以viewInited可能触发多次
     * @name Vframe#viewInited
     * @event
     * @param {Object} e
     */

    /**
     * view卸载时触发，由于vframe可以渲染不同的view，因此该事件可能被触发多次
     * @name Vframe#viewUnmounted
     * @event
     */

    /**
     * 子孙view修改时触发
     * @name Vframe#alter
     * @event
     * @param {Object} e
     */

    /**
     * 子孙view创建完成时触发
     * @name Vframe#created
     * @event
     * @param {Object} e
     */

    /**
     * vframe销毁时触发
     * @name Vframe#destroy
     * @event
     */
});

/**
 * Vframe 中的2条线
 * 一：
 *     渲染
 *     每个Vframe有cC(childrenCount)属性和cM(childrenItems)属性
 *
 * 二：
 *     修改与创建完成
 *     每个Vframe有rC(readyCount)属性和rM(readyMap)属性
 *
 *      fca firstChildrenAlter  fcc firstChildrenCreated
 */
    return Vframe;
});