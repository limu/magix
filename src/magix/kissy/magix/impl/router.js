/**
 * @fileOverview router中根据底层类库需要重写的方法
 * @author 行列
 * @version 1.0
 */
KISSY.add("magix/impl/router",function(S,E){
    var W=window;
    return {
        useState:function(){
            var me=this,initialURL=location.href;
            E.on(W,'popstate',function(e){
                var equal=location.href==initialURL;
                if(!me.$firedPop&&equal)return;
                me.$firedPop=true;
                console.log('push?',e.type,e.state);
                me.route();
            });
        },
        useHash:function(){//extension impl change event
            var me=this;
            E.on(W,'hashchange',function(e){
                me.route();
            });
        }
    }
},{
    requires:["event"]
});