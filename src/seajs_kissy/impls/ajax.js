define("magix/impls/ajax",function(require){
    var S=KISSY,
        Ajax={},
        io;
    S.use('ajax',function(S,IO){io=IO});
    Ajax.send=function(ops){
		var me=this;
        ops=me.processOptions(ops);
        io({
            url:ops.url,
            dataType:ops.dataType,
			type:ops.method,
            success:function(data,textStatus,xhr){
				me.fireGlobalSetting(xhr);
                ops.success(data);
            },
            error:function(data,textStatus,xhr){
				me.fireGlobalSetting(xhr);
                ops.error(textStatus);
            }
        });
    }
    return Ajax;
});
