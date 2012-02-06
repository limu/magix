define("magix/impls/template",function(require){
    var S=KISSY,
        Template={},
        tmpl;
    S.use('template',function(S,T){tmpl=T});
    Template.toHTML=function(ops){
        ops=this.processOptions(ops);
        return tmpl(ops.template).render(ops.data);
    };
    return Template;
});