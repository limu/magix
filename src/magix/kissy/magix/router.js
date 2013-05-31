/**
 * @fileOverview 路由
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/router',function(S,Magix,Event,SE){
    eval(Magix.include('../tmpl/router'));
    Router.useState=function(){
        var me=this,initialURL=location.href;
        SE.on(WIN,'popstate',function(e){
            var equal=location.href==initialURL;
            if(!me.popFired&&equal)return;
            me.popFired=1;
            console.log('push?',e.type,e.state);
            me.route();
        });
    };
    Router.useHash=function(){//extension impl change event
        var me=this;
        SE.on(WIN,'hashchange',function(e){
            me.route();
        });
    };
    return Router;
},{
    requires:["magix/magix","magix/event","event"]
});