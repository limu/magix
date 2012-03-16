//implement model
KISSY.add("magix/impls/model",function(S,MVC,Base){
	var iModel=MVC.Model;
	S.mix(iModel.prototype,Base.Events);
	//
	//让kissy中的事件传递给magix
	var oldFire=iModel.prototype.fire;
	iModel.prototype.fire=function(type,eventData){
	    oldFire(type,eventData);
		if(type.charAt(0)=='*'){//这。。我想跳河了。。。
			type=type.substring(1).replace(/[A-Z]/,function(m){//第一个大写字母转小写
				return m.toLowerCase();
			});
			console.log(type);
			this.trigger(type,eventData);
		}else{
			this.trigger(type,eventData);
		}
	};
	/*iModel.prototype.hasChanged=function(prop){
		var _vs=this.__propsValueChanged;
		if(_vs){
			return _vs[prop];
		}
		return false;
	};*/
	iModel.prototype.unset=function(prop){
		this.removeAttr(prop);
	};
	iModel.prototype.clear=function(){
		var json=this.toJSON();
		for(var prop in json){
			this.removeAttr(prop);
		}
	};
	return iModel;
},{
	requires:["mvc","magix/base"]
});