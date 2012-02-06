define("magix/impls/view", ["magix/vom", "magix/ajax", "magix/template", "magix/base"], function(require, exports, module) {
	var vom = require("magix/vom");
	var Base=require("magix/base");
	var ajax=require("magix/ajax");
	var template=require("magix/template");
	//var router=require("magix/router");
	var S=KISSY;
	var MVC;
	S.use('mvc',function(S,mvc){MVC=mvc});
	var iView=function(){
		iView.superclass.constructor.apply(this,arguments);
		console.log('iView constructor');
	};
	console.log('view tmplate:',template);
	S.extend(iView,MVC.View,{
		initial:function(){
			this.delegateEvents();
		},
		getVOMObject:function(){
			return vom;
		},
		getAjaxObject:function(){
		    return ajax;
		},
		getTemplateObject:function(){
		    return template;
		},
		/*getRouterObject:function(){
		    return router;
		},*/
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
});
