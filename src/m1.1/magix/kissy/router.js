/**
 * @fileOverview 路由
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/router',function(S,Magix,Event,SE){
    eval(Magix.include('../tmpl/router'));
    Router.useState=function(){
        var me=Router,initialURL=location.href;
        SE.on(WIN,'popstate',function(e){
            var equal=location.href==initialURL;
            if(!me.poped&&equal)return;
            me.poped=1;
            console.log('push?',e.type,e.state);
            me.route();
        });
    };
    Router.useHash=function(){//extension impl change event
        SE.on(WIN,'hashchange',Router.route);
    };
    return Router;
},{
    requires:["magix/magix","magix/event","event"]
});