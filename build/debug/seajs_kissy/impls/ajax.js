define("magix/impls/ajax",function(require){
    var S=KISSY,
        Ajax={},
        io;
    S.use('ajax',function(S,IO){io=IO});
    Ajax.send=function(ops){
		var me=this;
        ops=this.processOptions(ops);
		var oldSucc=ops.success,
			oldErr=ops.error;
        io(S.mix(ops,{
            url:ops.url,
            dataType:ops.dataType,
			type:ops.method,
            success:function(data,textStatus,xhr){
				me.fireGlobalSetting(xhr);
                oldSucc.call(ops,data);
            },
            error:function(data,textStatus,xhr){
				me.fireGlobalSetting(xhr);
                oldErr.call(ops,textStatus);
            }
        }));
    }
    return Ajax;
});
