KISSY.add("magix/impls/ajax",function(S,io){
    var Ajax={};
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
    };
    return Ajax;
},{
    requires:["ajax"]
})
