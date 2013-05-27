KISSY.add("magix/body",function(S,Magix,Event,SE){
    var C={};
    eval(Magix.include('../tmpl/body'));
    Body.onUnbubble=function(node,type){
        var me=this;
        SE.delegate(node,type,'*[mx-'+type+']',C[type]=function(e){
            me.processEvent(e);
        });
    };
    Body.offUnbubble=function(node,type){
        SE.undelegate(node,type,'*[mx-'+type+']',C[type]);
        delete C[type];
    };
    return Body;
},{
    requires:["magix/magix","magix/event","event"]
});