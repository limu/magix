KISSY.add("magix/template",function(S,impl,Base){
    var Template;
    eval(Base.include("../tmpls/template"));
    return Base.implement(Template,impl);
},{
    requires:["magix/impls/template","magix/base"]
});
