/**
 * @fileOverview 对magix/view的扩展
 * @version 1.0
 * @author 行列
 */
KISSY.add('mxext/view',function(S,Magix,View,Router,VM){
    var WIN=window;
    var COMMA=',';
    var DestroyManagedTryList='destroy,abort,stop,cancel,remove'.split(COMMA);
    var ResCounter=0;
    var safeExec=Magix.safeExec;
    var HAS=Magix.has;
    var VOMEventsObject={};
    var PrepareVOMMessage=function(vom){
        if(!PrepareVOMMessage.d){
            PrepareVOMMessage.d=1;
            vom.on('add',function(e){
                var vf=e.vframe;
                var list=VOMEventsObject[vf.id];
                if(list){
                    for(var i=0;i<list.length;i++){
                        PostMessage(vf,list[i]);
                    }
                    delete VOMEventsObject[vf.id];
                }
            });
            vom.on('remove',function(e){
                delete VOMEventsObject[e.vframe.id];
            });
            var vf=vom.root();
            vf.on('childrenCreated',function(){
                VOMEventsObject={};
            });
        }
    };
    var PostMessage=function(vframe,args){
        var view=vframe.view;
        if(view&&vframe.viewUsable){
            safeExec(view.receiveMessage,args,view);
        }else{
            var interact=function(e){
                vframe.un('viewInteract',interact);
                safeExec(e.view.receiveMessage,args,e.view);
            };
            vframe.on('viewInteract',interact);
        }
    };
    /**
     * @name MxView
     * @namespace
     * @requires View
     * @augments View
     */
    var MxView=View.extend({
        mxViewCtor:Magix.noop,//供扩展用
        /**
         * 调用magix/router的navigate方法
         * @param {Object|String} params 参数字符串或参数对象
         */
        navigate:function(params){
            Router.navigate.apply(Router,arguments);
        },
        /**
         * 让view帮你管理资源，对于异步回调函数更应该调用该方法进行托管
         * 当调用该方法后，您不需要在异步回调方法内判断当前view是否已经销毁
         * 同时对于view刷新后，上个异步请求返回刷新界面的问题也得到很好的解决。<b>强烈建议对异步回调函数，组件等进行托管</b>
         * @param {String|Object} key 托管的资源或要共享的资源标识key
         * @param {Object} [res] 要托管的资源
         * @return {Object} 返回传入的资源，对于函数会自动进行一次包装
         * @example
         * init:function(){
         *      this.manage('user_list',[//管理对象资源
         *          {id:1,name:'a'},
         *          {id:2,name:'b'}
         *      ]);
         * },
         * render:function(){
         *      var _self=this;
         *      var m=new Model();
         *      m.load({
         *          success:_self.manage(function(resp){//管理匿名函数
         *              //TODO
         *              var brix=new BrixDropdownList();
         *
         *              _self.manage(brix);//管理组件
         *
         *              var pagination=_self.manage(new BrixPagination());//也可以这样
         *
         *              var timer=_self.manage(setTimeout(function(){
         *                  S.log('timer');
         *              },2000));//也可以管理定时器
         *
         *              
         *              var userList=_self.getManaged('user_list');//通过key取托管的资源
         *
         *              S.log(userList);
         *          }),
         *          error:_self.manage(function(msg){
         *              //TODO
         *          })
         *      })
         * }
         */
        manage:function(key,res){
            var me=this;
            var args=arguments;
            var hasKey=true;
            if(args.length==1){
                res=key;
                key='res_'+(ResCounter++);
                hasKey=false;
            }
            if(!me.$resCache)me.$resCache={};
            var wrapObj={
                hasKey:hasKey,
                res:res
            };
            me.$resCache[key]=wrapObj;
            return res;
        },
        /**
         * 获取托管的资源
         * @param {String} key 托管资源时传入的标识key
         * @return {[type]} [description]
         */
        getManaged:function(key){
            var me=this;
            var cache=me.$resCache;
            var sign=me.sign;
            if(cache&&HAS(cache,key)){
                var wrapObj=cache[key];
                var resource=wrapObj.res;
                return resource;
            }
            return null;
        },
        /**
         * 移除托管的资源
         * @param {String|Object} param 托管时标识key或托管的对象
         * @return {Object} 返回移除的资源
         */
        removeManaged:function(param){
            var me=this,res=null;
            var cache=me.$resCache;
            if(cache){
                if(HAS(cache,param)){
                    res=cache[param].res;
                    delete cache[param];
                }else{
                    for(var p in cache){
                        if(cache[p].res===param){
                            res=cache[p].res;
                            delete cache[p];
                            break;
                        }
                    }
                }
            }
            return res;
        },
        /**
         * 销毁托管的资源
         * @param {Boolean} [byRefresh] 是否是刷新时的销毁
         * @private
         */
        destroyManaged:function(byRefresh){
            var me=this;
            var cache=me.$resCache;
            //console.log('vvvvvvvvvvvvvv',cache);
            if(cache){
                for(var p in cache){
                    var o=cache[p];
                    //var processed=false;
                    var res=o.res;
                    if(Magix.isNumber(res)){//数字，有可能是定时器
                        WIN.clearTimeout(res);
                        WIN.clearInterval(res);
                        //processed=true;
                    }else if(res){
                        if(res.nodeType&&res.parentNode){
                            S.one(res).remove();
                            //processed=true;
                        }else{
                            for(var i=0;i<DestroyManagedTryList.length;i++){
                                if(Magix.isFunction(res[DestroyManagedTryList[i]])){
                                    safeExec(res[DestroyManagedTryList[i]],[],res);
                                    //processed=true;
                                    //不进行break,比如有时候可能存在abort 和  destroy
                                }
                            }
                        }
                    }
                    /*me.fire('destroyResource',{
                        resource:res,
                        processed:processed
                    });*/
                    if(byRefresh&&!o.hasKey){//如果是刷新且托管时没有给key值，则表示这是一个不会在其它方法内共享托管的资源，view刷新时可以删除掉
                        delete cache[p];
                    }
                }
                if(!byRefresh){//如果不是刷新，则是view的销毁
                    //me.un('destroyResource');
                    delete me.$resCache;
                }
            }
        },
        /**
         * 用于接受其它view通过postMessageTo方法发来的消息，供最终的view开发人员进行覆盖
         * @function
         * @param {Object} e 通过postMessageTo传递的第二个参数
         */
        receiveMessage:Magix.noop,
        /**
         * 向某个vframe发送消息
         * @param {Array|String} aims  目标vframe id数组
         * @param {Object} args 消息对象
         */
        postMessageTo:function(aims,args){
            var vom=this.vom;
            PrepareVOMMessage(vom);

            if(!Magix.isArray(aims)){
                aims=[aims];
            }
            if(!args)args={};
            for(var i=0,it;i<aims.length;i++){
                it=aims[i];
                var vframe=vom.get(it);
                if(vframe){
                    PostMessage(vframe,args);
                }else{
                    if(!VOMEventsObject[it]){
                        VOMEventsObject[it]=[];
                    }
                    VOMEventsObject[it].push(args);
                }
            }
        },
        /**
         * @private
         */
        destroyMRequest:function(){
            var me=this;
            var cache=me.$resCache;
            if(cache){
                for(var p in cache){
                    var o=cache[p];
                    var res=o.res;
                    if(res&&res.fetchOne&&res.fetchAll){//销毁MRequest
                        res.destroy();
                        delete cache[p];
                    }
                }
            }
        }
    },function(){
        var me=this;
        me.on('interact',function(){
            me.on('rendercall',function(){
                me.destroyMRequest();
            });
            me.on('prerender',function(){
                me.destroyManaged(true);
            });
            me.on('destroy',function(){
                me.destroyManaged();
            });
        });
        me.mxViewCtor();
    });
    return MxView;
    /*
        推荐使用的事件，KISSY这块的
        queryEvents:{
            mouseover:{
                '#id':function(){
                    
                },
                '.title':function(){//  S.one('.title').click(); S.one().delegate(); 
                    
                }
            },
            mouseenter:{
                '#id':function(e){
                    
                }
            }
        }
     */
    //return View.extend({
        /*attachQueryEvents:function(){
            var me=this;
            var queryEvents=me.queryEvents;
            if(queryEvents){
                me.$queryEventsCache={};
                for(var p in queryEvents){
                    var evts=queryEvents[p];
                    for(var q in evts){
                        //console.log('#'+me.id+' '+q,S.all('#'+me.id+' '+q));
                        S.all('#'+me.id+' '+q).on(p,me.$queryEventsCache[p+'_'+q]=(function(fn){
                            return function(e){
                                if(me.enableEvent){
                                    var targetId=View.idIt(e.target);
                                    var currentId=View.idIt(e.currentTarget);
                                    Magix.safeExec(fn,{
                                        view:me,
                                        targetId:targetId,
                                        currentId:currentId,
                                        queryEvents:queryEvents,
                                        domEvent:e
                                    },queryEvents);
                                }
                            }
                        }(evts[q])));
                    }
                }
            }
            //console.log(me);
        },*/
        /**
         * 清除根据选择器添加的事件
         */
        /*detachQueryEvents:function(){
            var me=this;
            var queryEvents=me.queryEvents;
            if(queryEvents){
                for(var p in queryEvents){
                    var evts=queryEvents[p];
                    for(var q in evts){
                        S.all('#'+me.id+' '+q).detach(p,me.$queryEventsCache[p+'_'+q]);
                    }
                }
                delete me.$queryEventsCache;
            }
        },*/
        
        
        /**
        
        
        
    },function(){
        var me=this;
        me.vm = new VM();
        me.on('interact',function(){
            me.on('rendercall',function(){
                me.destroyAsyncall();
            });
            me.on('prerender',function(){
                me.destroyManaged(true);
                me.detachQueryEvents();
            });
            me.on('rendered',function(){
                me.attachQueryEvents();
            });
            me.on('destroy',function(){
                me.destroyManaged();
            });
        });
    });*/


    /**
     * view销毁托管资源时发生
     * @name MxView#destroyResource
     * @event
     * @param {Object} e
     * @param {Object} e.resource 托管的资源
     * @param {Boolean} e.processed 表示view是否对这个资源做过销毁处理，目前view仅对带 abort destroy dispose方法的资源进行自动处理，其它资源需要您响应该事件自已处理
     */
},{
    requires:["magix/magix","magix/view","magix/router"]
});