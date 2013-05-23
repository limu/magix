var Has=Magix.has;
var VframesCount=0;
var FirstVframesLoaded=0;
var LastPercent=0;
var FirstReady=0;
var Vframes={};
var Loc;

/**
 * VOM对象
 * @name VOM
 * @namespace
 */
var VOM=Magix.mix({
    /**
     * @lends VOM
     */
    /**
     * 获取所有的vframe对象
     * @return {Object}
     */
    all:function(){
        return Vframes;
    },
    /**
     * 注册vframe对象
     * @param {Vframe} vf Vframe对象
     */
    add:function(vf){
        if(!Has(Vframes,vf.id)){
            VframesCount++;
            Vframes[vf.id]=vf;
            vf.owner=VOM;
            VOM.fire('add',{vframe:vf});
        }
    },
    /**
     * 根据vframe的id获取vframe对象
     * @param {String} id vframe的id
     * @return {Vframe} vframe对象
     */
    get:function(id){
        return Vframes[id];
    },
    /**
     * 删除已注册的vframe对象
     * @param {String} id vframe对象的id
     */
    remove:function(id,cc){
        //var id=Magix.isString(vf)?vf:vf.id;
        var vf=Vframes[id];
        if(vf){
            VframesCount--;
            if(cc)FirstVframesLoaded--;
            delete Vframes[id];
            VOM.fire('remove',{vframe:vf});
        }
    },
    /**
     * 通知其中的一个view创建完成
     */
    childCreated:function(){
        if(!FirstReady){
            FirstVframesLoaded++;
            var np=FirstVframesLoaded/VframesCount;
            if(LastPercent<np){
                VOM.fire('progress',{
                    percent:LastPercent=np
                });
                if(np==1){
                    FirstReady=1;
                    VOM.un('progress');
                }
            }
        }
    },
    /**
     * 获取根vframe对象
     */
    root:function(){
        return Vframe.root(VOM);
    },
    /**
     * 重新渲染根vframe
     * @param {Object} e Router.locationChanged事件对象
     * @param {Object} e.location window.location.href解析出来的对象
     * @param {Object} e.changed 包含有哪些变化的对象
     */
    remountRoot:function(e){
        //console.log('mount rootVframe view',location);
        var vf=VOM.root();
        //me.$loc=e.location;
        //console.log('rootView',e.location.view);
        Loc=e.location;
        vf.mountView(Loc.view);
    },
    /**
     * 向vframe通知地址栏发生变化
     * @param {Object} e 事件对象
     * @param {Object} e.location window.location.href解析出来的对象
     * @param {Object} e.changed 包含有哪些变化的对象
     */
    locationChanged:function(e){
        Loc=e.location;
        var vf=VOM.root();
        vf.locationChanged(Loc,e.changed);
    },
    /**
     * 更新view的location对象
     * @param  {Object} loc location
     */
    locationUpdated:function(loc){
        Loc=loc;
        var vf=VOM.root();
        vf.locationUpdated(loc);
    },
    /**
     * 获取window.location.href解析后的对象
     * @return {Object}
     */
    getLocation:function(){
        return Loc;
    }
    /**
     * view加载完成进度
     * @name VOM.progress
     * @event
     * @param {Object} e
     * @param {Object} e.precent 百分比
     */
    /**
     * 注册vframe对象时触发
     * @name VOM.add
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     */
    /**
     * 删除vframe对象时触发
     * @name VOM.remove
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     */
},Event);