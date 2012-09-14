//view
KISSY.add("magix/impls/view",function(S,MVC,T,ajax,VOM,Base){
	//
	var iView=function(){
		iView.superclass.constructor.apply(this,arguments);
		
	};

	var ex=function(props,staticProps){
		var fn=function(){
			fn.superclass.constructor.apply(this,arguments);
		}
		fn.extend=ex;
		return S.extend(fn,this,props,staticProps);
	};

	iView.extend=ex;

	S.extend(iView,MVC.View,{
		initial:function(){
			this.delegateEvents();
		},
	    getVOMObject:function(){
            return VOM;
        },
        getAjaxObject:function(){
            return ajax;
        },
        getTemplateObject:function(){
            return T;
        },
        dispose:function(){
            iView.superclass.destroy.apply(this,arguments);
            
        }
	});
	S.mix(iView.prototype,Base.Events);
	
	//让kissy中的事件传递给magix
	var oldFire=iView.prototype.fire;
    iView.prototype.fire=function(type,eventData){
        oldFire(type,eventData);
        this.trigger(type,eventData);
    }
	return iView;
},{
	requires:["mvc","magix/template","magix/ajax","magix/vom","magix/base"]
})
