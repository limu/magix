define("magix/impls/ajax",["jquery"],function(require){
    var Ajax={},
        jQuery=require("jquery");
    Ajax.send=function(ops){
		var me=this;
        ops=me.processOptions(ops);
		var oldSucc=ops.success,
			oldErr=ops.error;
        jQuery.ajax(Base.mix(ops,{
            url:ops.url,
            dataType:ops.dataType,
			type:ops.method,
            success:function(data,textStatus,jqXHR){
				me.fireGlobalSetting(jqXHR);
                 oldSucc.call(ops,data);
            },
            error:function(jqXHR, textStatus, errorThrown){
				me.fireGlobalSetting(jqXHR);
                oldErr.call(ops,textStatus);
            }
        }));
    }
    return Ajax;
});
