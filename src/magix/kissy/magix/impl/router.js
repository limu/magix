/**
 * @fileOverview router中根据底层类库需要重写的方法
 * @author 行列
 * @version 1.0
 */
KISSY.add("magix/impl/router",function(S){
	return {
		useHistoryState:function(){
			var me=this,initialURL=location.href;
			S.one(window).on('popstate',function(e){
				var equal=location.href==initialURL;
				if(!me.$canFirePopState&&equal)return;
				me.$canFirePopState=true;
				console.log('push?',e.type,e.state);
				me.route();
			});
		},
		useLocationHash:function(){
			var me=this;
			S.one(window).on('hashchange',function(e){
				me.suspend();
				console.log('hashchange');
				me.route();
				me.resume();
			});
		}
	}
});