KISSY.add("magix/impl/body",function(S,E){
    var C={};
    return {
        onUnbubble:function(node,type){
            var me=this;
            E.delegate(node,type,'*[mx-'+type+']',C[type]=function(e){
                me.processEvent(e);
            });
        },
        offUnbubble:function(node,type){
            E.undelegate(node,type,'*[mx-'+type+']',C[type]);
            delete C[type];
        }
    } 
},{
    requires:["event"]
});