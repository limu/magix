KISSY.add("mxext/router",function(S,R,E){
    var W=window;
    R.useState=function(){
        var me=this,initialURL=location.href;
        var lastHref=initialURL;
        var newHref;
        E.on(W,'popstate',function(e){
            var newHref=location.href;
            var equal=newHref==initialURL;
            if(!me.popFired&&equal)return;
            me.popFired=true;
            if(newHash!=lastHref){
                e={
                    backward:function(){
                        e.p=1;
                        history.replaceState(S.now(),document.title,lastHref);
                        me.fire('change:backward');
                    },
                    forward:function(){
                        e.p=1;
                        lastHref=newHref;
                        me.route();
                    },
                    prevent:function(){
                        e.p=1;
                        me.fire('change:prevent');
                    },
                    location:me.parseQH(newHref)
                };
                me.fire('change',e);
                if(!e.p){
                    e.forward();
                }
            }
        });
    };
    R.useHash=function(){
        var me=this,lastHash=me.parseQH().srcHash;
        var newHash;
        E.on(W,'hashchange',function(e,loc){
            loc=me.parseQH();
            newHash=loc.srcHash;
            if(newHash!=lastHash){
                e={
                    backward:function(){
                        e.p=1;
                        location.hash='#!'+lastHash;
                        me.fire('change:backward');
                    },
                    forward:function(){
                        e.p=1;
                        lastHash=newHash;
                        me.route();
                    },
                    prevent:function(){
                        e.p=1;
                        me.fire('change:prevent');
                    },
                    location:loc
                };
                me.fire('change',e);
                if(!e.p){
                    e.forward();
                }
            }
        });
    }
},{
    requires:["magix/router","event"]
});