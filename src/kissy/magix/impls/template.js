KISSY.add("magix/impls/template",function(S,T){
    var iTemplate={
        toHTML:function(ops){
            ops=this.processOptions(ops);
            return T(ops.template).render(ops.data);
        }
    };
    return iTemplate;
},{
    requires:["template"]
});
