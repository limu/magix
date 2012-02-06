KISSY.add("magix/ajax",function(S,impl,Base){
    var Ajax;
    eval(Base.include("../tmpls/ajax"));
    return Base.implement(Ajax,impl);
},{
    requires:["magix/impls/ajax","magix/base"]
});