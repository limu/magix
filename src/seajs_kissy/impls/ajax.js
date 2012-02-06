define("magix/impls/ajax",function(require){
    var S=KISSY,
        Ajax={},
        io;
    S.use('ajax',function(S,IO){io=IO});
    Ajax.send=function(ops){
        ops=this.processOptions(ops);
        io({
            url:ops.url,
            dataType:ops.dataType,
            success:function(data){
                ops.success(data);
            },
            error:function(msg){
                ops.failure(msg);
            }
        });
    }
    return Ajax;
});
