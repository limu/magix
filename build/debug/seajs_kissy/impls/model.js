define("magix/impls/model",["magix/base"], function(require) {
	var S=KISSY,
		Base=require("magix/base"),
		iModel;
	S.use('mvc',function(S,MVC){
		iModel=MVC.Model;
	});
	S.mix(iModel.prototype,Base.Events);
	
	//
	//让kissy中的事件传递给magix
	var oldFire=iModel.prototype.fire,
		change=/^after(.+?)Change$/;
	iModel.prototype.fire=function(type,eventData){
	    oldFire(type,eventData);
		if(type.charAt(0)=='*'){//这。。我想跳河了。。。
			type=type.substring(1).replace(/[A-Z]/,function(m){//第一个大写字母转小写
				return m.toLowerCase();
			});
			
			this.trigger(type,eventData);
		}else{
			this.trigger(type,eventData);
		}
		if(change.test(type)){
			var name=type.replace(change,function(m,g1){
				return g1.toLowerCase();
			});
			if(!this.__propsValueChanged)this.__propsValueChanged={};
			this.__propsValueChanged[name]=true;
		}
	};
	iModel.prototype.hasChanged=function(prop){
		var _vs=this.__propsValueChanged;
		if(_vs){
			return _vs[prop];
		}
		return false;
	};
	iModel.prototype.clear=function(){
		var json=this.toJSON();
		for(var prop in json){
			this.removeAttr(prop);
		}
	};
	return iModel;
});