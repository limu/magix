define("magix/impls/model",["magix/base"], function(require) {
	var S=KISSY,
		Base=require("magix/base"),
		iModel;
	S.use('mvc',function(S,MVC){
		iModel=MVC.Model;
	});
	S.mix(iModel.prototype,Base.Events);
	
	//让kissy中的事件传递给magix
    var oldFire=iModel.prototype.fire;
    iModel.prototype.fire=function(type,eventData){
        oldFire(type,eventData);
        this.trigger(type,eventData);
    }
	return iModel;
});