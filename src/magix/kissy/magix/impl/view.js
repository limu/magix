/**
 * @fileOverview view中根据底层类库需要重写的方法
 * @author 行列
 * @version 1.0
 */
KISSY.add("magix/impl/view",function(S,io,Magix){
    var IView=function(){

    };
    var Mods=S.Env.mods;
    var StaticWhiteList={
        wrapAsyn:1,
        extend:1
    };

    var ProcessObject=function(props,proto,enterObject){
        for(var p in proto){
            if(S.isObject(proto[p])){
                if(!Magix.has(props,p))props[p]={};
                ProcessObject(props[p],proto[p],true);
            }else if(enterObject){
                props[p]=proto[p];
            }
        }
    };
    IView.extend=function(props,ctor){
        var me=this;
        var BaseView=function(){
            BaseView.superclass.constructor.apply(this,arguments);
            if(ctor){
                Magix.safeExec(ctor,arguments,this);
            }
        }
        BaseView.extend=IView.extend;
        return S.extend(BaseView,me,props);
    };

    IView.prepare=function(oView,toProto){
        var me=this;
        if(!oView.wrapAsyn){
            for(var p in me){
                if(Magix.has(StaticWhiteList,p)){
                    oView[p]=me[p];
                }
            }
            var aimObject=oView.prototype;
            var start=oView;
            var temp;
            while(start.superclass){
                temp=start.superclass.constructor;
                ProcessObject(aimObject,temp.prototype);
                start=temp;
            }
            toProto.home=Mods[toProto.path].packageInfo.getBase();
            Magix.mix(aimObject,toProto);
        }
        oView.wrapAsyn();
    };

    Magix.mix(IView.prototype,{
        fetchTmpl:function(path,fn,d){
            io({
                url:path+(d?'?_='+S.now():''),
                success:fn,
                error:function(e,m){
                    fn(m)
                }
            });
        }
    });

    return IView;
},{
    requires:["ajax","magix/magix"]
});