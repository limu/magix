define("magix/impls/ajax",["jquery"],function(require){
    var Ajax={},
        jQuery=require("jquery");
    Ajax.send=function(ops){
        ops=this.processOptions(ops);
        jQuery.ajax({
            url:ops.url,
            dataType:ops.dataType,
            success:function(data){
                ops.success(data);
            },
            error:function(jqXHR, textStatus, errorThrown){
                ops.failure(textStatus);
            }
        });
    }
    return Ajax;
});
