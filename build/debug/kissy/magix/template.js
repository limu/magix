KISSY.add("magix/template",function(S,impl,Base){
    var Template;
    //模板
Template={
    /*
     * 默认参数
     */
    defaultOptions:{
        data:{},
        template:''
    },
    processOptions:function(ops){
        var me=this;
        for(var p in me.defaultOptions){
            if(!ops[p])ops[p]=me.defaultOptions[p];
        }
        return ops;
    },
    toHTML:Base.unimpl
};
    return Base.implement(Template,impl);
},{
    requires:["magix/impls/template","magix/base"]
});
