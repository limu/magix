KISSY.add("magix/impls/template",function(S,Mustache){
    var iTemplate={
        toHTML:function(ops){
            ops=this.processOptions(ops);
            return Mustache.to_html(ops.template,ops.data);
        }
    };
    return iTemplate;
},{
    requires:["magix/mu"]
});