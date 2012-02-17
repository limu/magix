KISSY.add("magix/impls/template",function(S,Tmpl){
    var iTemplate={
        toHTML:function(ops){
            ops=this.processOptions(ops);
            return Tmpl.toHTML(ops.template,ops.data);
        }
    };
    return iTemplate;
},{
    requires:["magix/tmpl"]
});