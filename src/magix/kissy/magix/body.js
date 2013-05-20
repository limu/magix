KISSY.add("magix/body",function(S,IBody,Magix,Event){
    eval(Magix.include('../tmpl/body'));
    return Magix.mix(Body,IBody);
},{
    requires:["magix/impl/body","magix/magix","magix/event"]
});