define("magix/impls/ajax",["jquery"],function(require){
    var Ajax={},
        jQuery=require("jquery");
    Ajax.send=function(ops){
		var me=this;
        ops=me.processOptions(ops);
        jQuery.ajax({
            url:ops.url,
            dataType:ops.dataType,
			type:ops.method,
            success:function(data,textStatus,jqXHR){
				me.fireGlobalSetting(jqXHR);
                ops.success(data);
            },
            error:function(jqXHR, textStatus, errorThrown){
				me.fireGlobalSetting(jqXHR);
                ops.error(textStatus);
            }
        });
    }
    return Ajax;
});
