var D=document;
var VframeIdCounter=1<<16;
var WIN=window;
var CollectGarbage=WIN.CollectGarbage||Magix.noop;

var Mix=Magix.mix;
var MxConfig=Magix.config();
var TagName=MxConfig.tagName;
var RootId=MxConfig.rootId;
var Has=Magix.has;
var DataView='mx-view';
var Alter='alter';
var Created='created';
var RootVframe;

var $=function(id){
    return typeof id=='object'?id:D.getElementById(id);
};
var $$=function(id,tag){
    return $(id).getElementsByTagName(tag);
};
var $C=function(tag){
    return D.createElement(tag);
};
$C(TagName);

var IdIt=function(dom){
    return dom.id||(dom.id='magix_vf_'+(VframeIdCounter--));
};
var ScriptsReg=/<script[^>]*>[\s\S]*?<\/script>/ig
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
 * @property {Boolean} viewUsable view是否可用，即view的interact事件有没有派发
 */
var Vframe=function(id){
    var me=this;
    me.id=id;
    me.vId=id+'_v';
    me.cS={};
    me.cC=0;
    me.rC=0;
    me.sign=1<<31;
    me.rM={};
};

Mix(Vframe,{
    /**
     * @lends Vframe
     */
    /**
     * 获取根vframe
     * @param {VOM} vom vom对象
     * @return {Vframe}
     */
    root:function(owner){
        if(!RootVframe){
            var e=$(RootId);
            if(!e){
                e=$C(TagName);
                e.id=RootId;
                D.body.insertBefore(e,D.body.firstChild);
            }
            RootVframe=new Vframe(RootId);
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
                vframeViewName=pv.getAttribute(DataView);
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
            rVf.setAttribute(DataView,vframeViewName);
        }
    }
}());*/
//

Mix(Mix(Vframe.prototype,Event),{
    /**
     * @lends Vframe#
     */
    /**
     * 是否启用场景转场动画，相关的动画并未在该类中实现，如需动画，需要mxext/vfanim扩展来实现，设计为方法而不是属性可方便针对某些vframe使用动画
     * @return {Boolean}
     * @default false
     * @function
     */
    useAnimUpdate:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，旧的view销毁时调用
     * @function
     */
    oldViewDestroy:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，为新view准备好填充的容器
     * @function
     */
    prepareNextView:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，新的view创建完成时调用
     * @function
     */
    newViewCreated:Magix.noop,
    /**
     * 加载对应的view
     * @param {String} viewPath 形如:app/views/home?type=1&page=2 这样的名称
     * @param {Object|Null} viewInitParams view在调用init时传递的参数
     */
    mountView:function(viewPath,viewInitParams){
        var me=this;
        var node=$(me.id);
        if(!node._bak){
            node._bak=1;
            node._tmpl=node.innerHTML.replace(ScriptsReg,'');
        }else{
            node._chgd=1;
        }
        var useTurnaround=me.vN&&me.useAnimUpdate();
        me.unmountView(useTurnaround,1);
        if(viewPath){
            var path=Magix.pathToObject(viewPath);
            var vn=path.pathname;
            var sign=--me.sign;
            Magix.libRequire(vn,function(View){
                if(sign==me.sign){//有可能在view载入后，vframe已经卸载了
                    var vom=me.owner;
                    BaseView.prepare(View,{
                        $:$,
                        path:vn,
                        vom:vom
                    });

                    var vId;
                    if(useTurnaround){
                        vId=me.vId;
                        me.prepareNextView();
                    }else{
                        vId=me.id;
                    }
                    var view=new View({
                        owner:me,
                        id:vId,
                        vId:me.vId,
                        vfId:me.id,
                        location:vom.getLocation()
                    });
                    me.view=view;
                    view.on('interact',function(e){//view准备好后触发
                        me.fire('viewInteract',{view:view});
                        me.viewUsable=1;
                        /*
                            Q:为什么在interact中就进行动画，而不是在rendered之后？
                            A:可交互事件发生后，到渲染出来view的界面还是有些时间的，但这段时间可长可短，比如view所需要的数据都在内存中，则整个过程就是同步的，渲染会很快，也有可能每次数据都从服务器拉取（假设时间非常长），这时候渲染显示肯定会慢，如果到rendered后才进行动画，就会有相当长的一个时间停留在前一个view上，无法让用户感觉到程序在运行。通常这时候的另外一个解决办法是，切换到拉取时间较长的view时，这个view会整一个loading动画，也就是保证每个view及时的显示交互或状态内容，这样动画在做转场时，从上一个view转到下一个view时都会有内容，即使下一个view没内容也能及时的显示出白板页面，跟无动画时是一样的，所以这个点是最好的一个触发点
                         */
                        if(useTurnaround){
                            me.newViewCreated(1);
                        }
                        
                        if(!e.tmpl){
                            if(!useTurnaround&&node._chgd){
                                node.innerHTML=node._tmpl;
                            }
                            me.mountZoneVframes(0,0,1);
                        }
                        view.on('rendered',function(){//再绑定rendered
                            //console.log('xxxxxxxxxxx',view.path);
                            me.mountZoneVframes(0,0,1);
                        });
                        view.on('prerender',function(e){
                            me.unmountZoneVframes(0,e.anim);
                        });
                    },0);
                    view.load(Mix(path.params,viewInitParams,true));
                }
            });
        }
    },
    /**
     * 销毁对应的view
     * @param {Boolean} useAnim 是否启用动画，在启用动画的情况下，需要保持节点内容，不能删除
     * @param {Boolean} isOutermostView 是否是最外层的view改变，不对内层的view处理
     */
    unmountView:function(useAnim,isOutermostView){
        var me=this;
        if(me.view){
            me.unmountZoneVframes(0,useAnim);
            console.log('unmountView:',me.id);
            me.childrenAlter({});
            me.fire('viewUnmount');
            me.view.destroy();
            var node=$(me.id);
            if(!useAnim&&node._bak){
                node.innerHTML=node._tmpl;
            }
            if(useAnim&&isOutermostView){//在动画启用的情况下才调用相关接口
                me.oldViewDestroy();
            }
            delete me.view;
            delete me.viewUsable;
            CollectGarbage();
        }
        me.un('viewInteract');
        me.sign--;
    },
    /**
     * 加载vframe
     * @param  {String} id             节点id
     * @param  {String} viewPath       view路径
     * @param  {Object} viewInitParams 传递给view init方法的参数
     * @param  {Boolean} byHand         是否自动渲染
     * @return {Vframe} vframe对象
     */
    mountVframe:function(id,viewPath,viewInitParams,autoMount){
        var me=this;
        var vom=me.owner;
        var vf=vom.get(id);
        if(!vf){
            vf=new Vframe(id);
            vf.pId=me.id;
            if(!Has(me.cS,id)){
                me.cC++;
            }
            me.cS[id]=autoMount;
            vom.add(vf);
        }
        vf.mountView(viewPath,viewInitParams);
        return vf;
    },
    /**
     * 加载当前view下面的子view，因为view的持有对象是vframe，所以是加载vframes
     * @param {zoneId} HTMLElement|String 节点对象或id
     */
    mountZoneVframes:function(zoneId,viewInitParams,autoMount){
        var me=this;
        me.unmountZoneVframes(zoneId);
        var owner=me.owner;
        var node;
        if(!zoneId){
            node=$(me.vId)||$(me.id);
        }else{
            node=zoneId;
        }
        var vframes=$$(node,TagName);
        var count=vframes.length;
        var subs={};
        if(count){
            for(var i=0,vframe,key;i<count;i++){
                vframe=vframes[i];
                key=IdIt(vframe);
                if(!Has(subs,key)){
                    me.mountVframe(
                        key,
                        vframe.getAttribute(DataView),
                        viewInitParams,
                        autoMount
                    );
                }
                var svs=$$(vframe,TagName);
                for(var j=0,c=svs.length;j<c;j++){
                    subs[IdIt(svs[j])]=1;
                }
            }
        }else{
            me.childrenCreated({});
        }
    },
    /**
     * 销毁vframe
     * @param  {String} id      节点id
     * @param  {Boolean} useAnim 是否使用动画，使用动画时不销毁DOM节点
     */
    unmountVframe:function(id,useAnim){
        var me=this;
        var vom=me.owner;
        var vf=vom.get(id);
        if(vf){
            var cc=vf.fcc;
            vf.unmountView(useAnim);
            vom.remove(id,cc);
            delete me.cS[id];
            me.cC--;
        }
    },
    /**
     * 销毁某个区域下面的所有子vframes
     * @param {zoneId} HTMLElement|String 节点对象或id
     * @param {Boolean} useAnim 是否使用动画，使用动画时DOM节点不销毁
     */
    unmountZoneVframes:function(zoneId,useAnim){
        var me=this;
        var children;
        if(zoneId){
            children=$$(zoneId,TagName);
            var ids={},cs=me.cS;
            for(var i=children.length-1,o;i>=0;i--){
                o=children[i].id;
                if(Has(cs,o)){
                    ids[o]=1;
                }
            }
            children=ids;
        }else{
            children=me.cS;
        }
        for(var p in children){
            me.unmountVframe(p);
        }
        if(!zoneId){
            me.cS={};
            me.cC=0;
        }
    },
    /**
     * 通知所有的子view创建完成
     */
    childrenCreated:function(e){
        var me=this;
        var view=me.view;
        if(view&&!me.fcc){
            me.fcc=1;
            delete me.fca;
            view.fire(Created,e);
            me.fire(Created,e);
        }
        var vom=me.owner;
        vom.childCreated();
        var pId=me.pId;
        var parent=vom.get(pId);
        if(parent){
            var mId=me.id;
            var pRM=parent.rM;
            if(!Has(pRM,mId)){
                pRM[mId]=parent.cS[mId];
                parent.rC++;
                if(parent.rC==parent.cC){
                    parent.childrenCreated(e);
                }
            }
        }
    },
    /**
     * 通知子vframe有变化
     */
    childrenAlter:function(e){
        var me=this;
        delete me.fcc;
        var view=me.view;
        var mId=me.id;
        if(view&&!me.fca){
            me.fca=1;
            view.fire(Alter,e);
            me.fire(Alter,e);
        }
        var vom=me.owner;
        var pId=me.pId;
        var parent=vom.get(pId);
        if(parent){
            var mId=me.id;
            var pRM=parent.rM;
            var autoMount=pRM[mId];
            if(Has(pRM,mId)){
                parent.rC--;
                delete pRM[mId];
                if(autoMount){
                    parent.childrenAlter(e);
                }                
            }
        }
    },
    /**
     * 通知当前vframe，地址栏发生变化
     * @param {Object} loc window.location.href解析出来的对象
     * @param {Object} chged 包含有哪些变化的对象
     */
    locationChanged:function(loc,chged){
        var me=this;
        var view=me.view;
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
        if(view&&view.sign){
            view.location=loc;
            if(view.rendered){//存在view时才进行广播，对于加载中的可在加载完成后通过调用view.location拿到对应的window.location.href对象，对于销毁的也不需要广播
                var isChanged=view.olChanged(chged);
                var args={
                    location:loc,
                    changed:chged,
                    prevent:function(){
                        this.cs=[];
                    },
                    toChildren:function(c){
                        c=c||[];
                        if(Magix.isString(c)){
                            c=c.split(',');
                        }
                        this.cs=c;
                    }
                };
                if(isChanged){//检测view所关注的相应的参数是否发生了变化
                    //safeExec(view.render,[],view);//如果关注的参数有变化，默认调用render方法
                    //否定了这个想法，有时关注的参数有变化，不一定需要调用render方法
                    Magix.safeExec(view.locationChange,args,view);
                }
                var cs=args.cs||Magix.keys(me.cS);
                //console.log(me.id,cs);
                for(var i=0,j=cs.length,vom=me.owner,vf;i<j;i++){
                    vf=vom.get(cs[i]);
                    if(vf){
                        vf.locationChanged(loc,chged);
                    }
                }
            }
        }
    },
    /**
     * 通知location更新
     * @param  {Object} loc location
     */
    locationUpdated:function(loc){
        var me=this;
        var view=me.view;
        if(view&&view.sign){
            view.location=loc;
            var children=me.cS;
            var vf;
            var vom=me.owner;
            for(var p in children){
                //if(Magix.has(children,p)){
                    vf=vom.get(p);
                    if(vf){
                        vf.locationUpdated(loc);
                    }
                //}
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
        if(view&&me.vced){*///表明属于vframe的view对象已经加载完成
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
            /*console.log('callback postMessageTo',mId);
            me.on(ViewLoad,function(e){
                safeExec(e.view.receiveMessage,args,e.view);
            });
        }
    }*/
    /**
     * view可交互时触发
     * @name Vframe#viewInteract 
     * @event
     * @param {Object} e view加载完成后触发
     */
    
    /**
     * view卸载时触发
     * @name Vframe#viewUnmount
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
});