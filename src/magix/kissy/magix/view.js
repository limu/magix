/**
 * @fileOverview view类
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/view',function(S,Magix,Event,Body,IO){
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
    eval(Magix.include('../tmpl/view'));

    View.prototype.fetchTmpl=function(path,fn,d){
        var l=ProcessObject[path];
        if(l){
            l.push(fn);
        }else{
            l=ProcessObject[path]=[fn];
            IO({
                url:path+(d?'?_='+S.now():''),
                success:function(x){
                    Magix.safeExec(l,x);
                    delete ProcessObject[path];
                },
                error:function(e,m){
                    Magix.safeExec(l,m);
                    delete ProcessObject[path];
                }
            });
        }
    };

    View.extend=function(props,ctor){
        var me=this;
        var BaseView=function(){
            BaseView.superclass.constructor.apply(this,arguments);
            if(ctor){
                Magix.safeExec(ctor,arguments,this);
            }
        }
        BaseView.extend=me.extend;
        return S.extend(BaseView,me,props);
    };
	View.prepare=function(oView,toProto){
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
    return View;
},{
    requires:["magix/magix","magix/event","magix/body","ajax"]
});