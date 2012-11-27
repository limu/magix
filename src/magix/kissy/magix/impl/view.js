/**
 * @fileOverview view中根据底层类库需要重写的方法
 * @author 行列
 * @version 1.0
 */
KISSY.add("magix/impl/view",function(S,io,Sizzle,Magix){
	var IView=function(){

	};
	var StaticWhiteList={
		idIt:1,
		wrapAsyncUpdate:1,
		registerAsyncUpdateName:1,
		extend:1
	};
	var ex=function(props,ctor){
		var me=this;
		var fn=function(){
			fn.superclass.constructor.apply(this,arguments);
			if(ctor){
				Magix.safeExec(ctor,[],this);
			}
		}
		for(var p in me){
			if(Magix.hasProp(StaticWhiteList,p)){
				fn[p]=me[p];
			}
		}
		return S.extend(fn,me,props);
	};

	IView.extend=ex;

	Magix.mix(IView.prototype,{
		getTmplByXHR:function(path,fn){
			io({
				url:path,
				dataType:'html',
				success:function(tmpl){
					fn(tmpl);
				},
				error:function(e,msg){
					fn(msg);
				}
			});
		},
		delegateUnbubble:function(node,event){
			var me=this;
			if(!me.$cacheEvents)me.$cacheEvents={};
			node=S.one(node);
			node.delegate(event,'*[mx'+event+']',me.$cacheEvents[event]=function(e){
				me.processEvent(e);
			});
		},
		undelegateUnbubble:function(node,event){
			var me=this;
			var cache=me.$cacheEvents;
			if(cache){
				node=S.one(node);
				//console.log('uuuuuuuuuuuuuuuuuuu',event);
				node.undelegate(event,'*[mx'+event+']',cache[event]);
				delete cache[event];
			}
		}
	});

	return IView;
},{
	requires:["ajax","sizzle","magix/magix"]
});