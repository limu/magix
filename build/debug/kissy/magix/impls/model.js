//implement model
KISSY.add("magix/impls/model",function(S,MVC,Base){
	var iModel=MVC.Model;
	S.mix(iModel.prototype,Base.Events);
	//
	//让kissy中的事件传递给magix
	var oldFire=iModel.prototype.fire;
	iModel.prototype.fire=function(type,eventData){
	    oldFire(type,eventData);
	    this.trigger(type,eventData);
	}
	return iModel;
},{
	requires:["mvc","magix/base"]
});