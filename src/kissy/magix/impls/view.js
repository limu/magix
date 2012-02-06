//view
KISSY.add("magix/impls/view",function(S,MVC,T,ajax,VOM,Base){
	//
	var iView=function(){
		iView.superclass.constructor.apply(this,arguments);
		console.log('iView constructor');
	};
	var templates={};
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
            console.log(iView.superclass.destroy);
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
