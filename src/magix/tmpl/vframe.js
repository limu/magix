var D=document;
var VframeIdCounter=0;

var safeExec=Magix.safeExec;

var DataView='data-view';

var $=function(id){
	return typeof id=='object'?id:D.getElementById(id);
};
var $$=function(id,tag){
	return $(id).getElementsByTagName(tag);
};
var $C=function(tag){
	return D.createElement(tag);
};
var ViewLoad='viewLoad';
var ChildrenCreated='childrenCreated';
/**
 * Vframe类
 * @name Vframe
 * @class
 * @constructor
 * @borrows Event.bind as this.bind
 * @borrows Event.trigger as this.trigger
 * @borrows Event.unbind as this.unbind
 * @param {HTMLElement} element dom节点
 * @property {String} id vframe id
 * @property {Array} children 子vframes
 * @property {View} view view对象
 * @property {VOM} owner VOM对象
 */
var Vframe=function(element){
	var me=this;
	me.id=Vframe.idIt(element);
	me.viewId=me.id+'_view';
	me.children=[];
	me.view=null;
	me.ready={o:{},c:0};
};
Magix.mix(Vframe,{
	/**
	 * @lends Vframe
	 */
	/**
	 * vframe 在页面上的标签名
	 * @type {String}
	 */
	tagName:'vframe',
	/**
	 * 给dom元素添加id
	 * @param {HTMLElement} dom dom节点
	 * @return {String} 节点的id
	 */
	idIt:function(dom){
		return dom.id||(dom.id='magix_vf_'+(VframeIdCounter++));
	},
	/**
	 * 创建Vframe对象
	 * @param {HTMLElement|String} element dom节点
	 * @param {Object} ops     其它属性
	 * @return {Vframe} 返回Vframe对象
	 */
	createVframe:function(element,ops){
		element=$(element);
		var vf=new Vframe(element);
		Magix.mix(vf,ops);
		return vf;
	},
	/**
	 * 创建vframe DOM节点
	 * @param {String} id     节点id
	 * @param {HTMLElement} before 插入在哪个节点前面
	 */
	createVframeNode:function(id,before){
		var vfNode=$C(Vframe.tagName);
		vfNode.id=id;
		before.parentNode.insertBefore(vfNode,before);
	}
});
/*
	修正IE下标签问题
	@2012.11.23
	暂时先不修正，如果页面上有vframe标签先create一下好了，用这么多代码代替一个document.createElement('vframe')太不值得
 */
/*(function(){
	var badVframes=$$(D,'/'+Vframe.tagName);
	var temp=[];
	for(var i=0,j=badVframes.length;i<j;i++){
		temp.push(badVframes[i]);
	}
	badVframes=temp;
	for(var i=0,j=badVframes.length;i<j;i++){
		var bVf=badVframes[i];
		var pv=bVf.previousSibling;
		var rVf=$C(Vframe.tagName);
		var pNode=pv.parentNode;
		var anchorNode=bVf.nextSibling;
		var vframeId;
		var vframeViewName;
		pNode.removeChild(bVf);
		temp=[];
		while(pv){
			if(pv.tagName&&pv.tagName.toLowerCase()==Vframe.tagName){
				vframeId=pv.id;
				vframeViewName=pv.getAttribute(DataView);
				pNode.removeChild(pv);
				break;
			}else{
				temp.push(pv);
				pv=pv.previousSibling;
			}
		}
		while(temp.length){
			rVf.appendChild(temp.pop());
		}
		pNode.insertBefore(rVf,anchorNode);
		if(vframeId){
			rVf.id=vframeId;
		}
		if(vframeViewName){
			rVf.setAttribute(DataView,vframeViewName);
		}
	}
}());*/
//
D.createElement(Vframe.tagName);

Magix.mix(Vframe.prototype,Event);
Magix.mix(Vframe.prototype,{
	/**
	 * @lends Vframe#
	 */
	/**
	 * 是否启用场景转场动画，相关的动画并未在该类中实现，如需动画，需要mxext/vfanim扩展来实现，设计为方法而不是属性可方便针对某些vframe使用动画
	 * @return {Boolean}
	 * @default false
	 */
	viewChangeUseAnim:function(){
		return false;
	},
	/**
	 * 转场动画时或当view启用刷新动画时，旧的view销毁时调用
	 * @function
	 */
	oldViewDestroy:Magix.noop,
	/**
	 * 转场动画时或当view启用刷新动画时，为新view准备好填充的容器
	 * @function
	 */
	prepareNextView:Magix.noop,
	/**
	 * 转场动画时或当view启用刷新动画时，新的view创建完成时调用
	 * @function
	 */
	newViewCreated:Magix.noop,
	/**
	 * 加载对应的view
	 * @param {String} viewName 形如:app/views/home 这样的名称
	 */
	mountView:function(viewName){
		var me=this;
		//me.owner.suspend();
		console.log(viewName,me.viewName,me.viewChangeUseAnim());
		var useTurnaround=me.viewName&&me.viewChangeUseAnim();
		//console.log('after',viewName,me.viewName,me.viewChangeUseAnim(),useTurnaround);
		me.unmountView(useTurnaround,true);
		if(viewName){
			me.viewName=viewName;
			//console.log('mountView:',viewName);
			var callback=function(View){
				console.log(viewName,me.viewName);
				if(viewName!=me.viewName){
					return;//有可能在view载入后，vframe已经卸载了
				}

				View.wrapAsyncUpdate();

				var viewId;
				if(useTurnaround){
					viewId=me.viewId;
					me.prepareNextView();
				}else{
					viewId=me.id;
				}

				var view=new View({
					viewName:viewName,
					owner:me,
					ownerVOM:me.owner,
					id:viewId,
					vId:me.viewId,
					vfId:me.id
				});

				view.bind('ready',function(e){//view准备好后触发
					view.bind('created',function(){
						console.log(me.id+' view created');
						me.trigger(ViewLoad,{view:view},true);
						me.viewCreated=true;
					});	
					if(useTurnaround){
						me.newViewCreated(true);
					}
					if(!e.tmpl){
						me.loadSubVframes();
					}
					view.bind('rendered',function(){//再绑定rendered
						me.loadSubVframes();
					});
					view.bind('prerender',function(e){
						me.unloadSubVframes(e.anim);
					});
				});
				me.view=view;
				view.load();
			};
			Magix.libRequire(viewName,callback);
		}
		//me.owner.resume();
	},
	/**
	 * 销毁对应的view
	 * @param {Boolean} useAnim 是否启用动画，在启用动画的情况下，需要保持节点内容，不能删除
	 * @param {Boolean} isOutermostView 是否是最外层的view改变，不对内层的view处理
	 */
	unmountView:function(useAnim,isOutermostView){
		var me=this;
		//me.owner.suspend();
		if(me.view){
			me.unloadSubVframes(useAnim);
			me.view.destroy(useAnim);
			if(useAnim&&isOutermostView){//在动画启用的情况下才调用相关接口
				me.oldViewDestroy();
			}		
			delete me.view;
			delete me.viewName;
		}else if(me.viewName){//view有可能在未载入就进行了unmoutView
			me.unbind(ViewLoad);
			me.unbind(ChildrenCreated);
			delete me.viewName;
		}
		//me.owner.resume();
	},
	/**
	 * 加载当前view下面的子view，因为view的持有对象是vframe，所以是加载vframes
	 */
	loadSubVframes:function(){
		var me=this;
		/*
			为什么要挂起？
			<vframe data-view="app/views/main" id="J_main">
				<vframe data-view="app/view/left" id="J_left"></vframe>
				<vframe data-view="app/view/right" id="J_right"></vframe>
			</vframe>

			考虑缓存的情况下，非缓存的不考虑：
			渲染时，J_main渲染后，发现子view left和right，在渲染子view时，是顺序渲染的，所以先渲染left,在left的render中假如我们要postMessageTo right，而此时显示还没渲染到right，所以这个消息肯定发送不成功

			注：如果未挂起vframe在mount left时，load left后，render(suspend)->delegate events->callback(suspend)->fire ready->(vframe listener)->left(resume)->render(find right->NULL)->callback

			挂起后;
				
				vframe loadSubVframes:
					leftVframe->loadLeftView->leftViewSuspend->render(suspend)->delegate evetns->callback(suspend)->fire ready->(vframe listener)->leftViewResume->..外界仍然挂起，leftView挂起的render callback不执行

					rightVframe->loadRightView->rightViewSuspend->render(suspend)->delegate events->callback(suspend)->fire ready->(vframe listener)->rightViewResume->..

				vframe resume

					leftRender leftCallback rightRender rightCallback

		 */
		me.owner.suspend();
		var	node=$(me.viewId)||$(me.id);
		//console.log(node);
		var	vframes=node.getElementsByTagName(Vframe.tagName);
		var count=vframes.length;
		if(count){
			for(var i=0,vframe;i<count;i++){
				vframe=vframes[i];
				vframe=Vframe.createVframe(vframe,{
					owner:me.owner,
					parentId:me.id
				});
				me.children.push(vframe.id);
				me.owner.registerVframe(vframe);
				vframe.bind(ChildrenCreated,function(){
					var r=me.ready;
					var id=this.id;
					if(!Magix.hasProp(r.o,id)){
						r.o[id]=1;
						r.c++;
					}
					if(r.c==me.children.length){
						me.ready={o:{},c:0};
						me.notifyChildrenCreated();
					}
				});
				vframe.mountView(vframes[i].getAttribute(DataView));
			}
		}else{
			me.notifyChildrenCreated();
		}
		me.owner.resume();
	},
	/**
	 * 销毁当前view下面的所有子vframes
	 * @param {Boolean} useAnim 是否使用动画，使用动画时DOM节点不销毁
	 */
	unloadSubVframes:function(useAnim){
		var me=this;
		var children=me.children;
		var child;
		for(var i=0,j=children.length,id;i<j;i++){
			id=children[i];
			//console.log(me.id+' notify unmountView:',id,useAnim);
			child=me.owner.getVframe(id);
			child.unmountView(useAnim);
			me.owner.unregisterVframe(child);
			$(id).id='';
		}
		me.children=[];
	},
	/**
	 * 向某个vframe发送消息
	 * @param {Array|String} aim  目标vframe id数组
	 * @param {Object} args 消息对象
	 */
	postMessageTo:function(aim,args){
		var me=this;
		//me.owner.idle(function(){//在外部闲置状态下才进行后续的处理
		var vom=me.owner;
		if(!Magix.isArray(aim)){
			aim=[aim];
		}
		if(!args)args={};
		console.log(aim);
		for(var i=0;i<aim.length;i++){
			var vframe=vom.getVframe(aim[i]);
			console.log(aim,vframe);
			if(vframe){
				var view=vframe.view;
				if(view){//表明属于vframe的view对象已经加载完成
					/*
						考虑
						<vframe id="v1" data-view="..."></vframe>
						<vframe id="v2" data-view="..."></vframe>
						<vframe id="v3" data-view="..."></vframe>
						
						v1渲染后postMessage向v2 v3发消息，此时v2 v3的view对象是构建好了，但它对应的模板可能并未就绪，需要等待到view创建完成后再发消息过去
					 */
					if(view.rendered){
						safeExec(view.receiveMessage,args,view);
					}else{
						view.bind('created',function(){
							safeExec(this.receiveMessage,args,this);
						});
					}					
				}else if(vframe.viewName){//经过上面的判断，到这一步说明开始加载view但尚未加载完成
					/*
						Q:当vframe没有view属性但有viewName表明属于这个vframe的view异步加载尚未完成，但为什么还要向这个view发送消息呢，丢弃不可以吗？

						A:考虑这样的情况，页面上有A B两个view，A在拿到数据完成渲染后会向B发送一个消息，B收到消息后才渲染。在加载A B两个view时，是同时加载的，这两个加载是异步，A在加载、渲染完成向B发送消息时，B view对应的js文件很有可能尚未载入完成，所以这个消息会由B vframe先持有，等B对应的view载入后再传递这个消息过去。如果不传递这个消息则Bview无法完成后续的渲染。vframe是通过对内容分析立即就构建出来的，view是对应的js加载完成才存在的，因异步的存在，所以需要这样的处理。
					 */
					vframe.bind(ViewLoad,function(e){
						safeExec(e.view.receiveMessage,args,e.view);
					});
				}//没view也没viewName，可能这个vframe是一个空的或者已经销毁，忽略掉这个消息
			}
		}
		//});	
	},
	/**
	 * 通知当前vframe，地址栏发生变化
	 * @param {Object} e 事件对象
	 * @param {Object} e.location window.location.href解析出来的对象
	 * @param {Object} e.changed 包含有哪些变化的对象
	 */
	notifyLocationChange:function(e){
		var me=this;
		var view=me.view;
		/*
			重点：
				所有手动mountView的都应该在合适的地方中断消息传递：
			示例：
				<div id="magix_vf_root">
					<vframe data-view="app/views/leftmenus" id="magix_vf_lm"></vframe>
					<vframe id="magix_vf_main"></vframe>
				</div>
			默认view中自动渲染左侧菜单，右侧手动渲染

			考虑右侧vframe嵌套并且缓存的情况下，如果未中断消息传递，有可能造成新渲染的view接收到消息后不能做出正确反映，当然左侧菜单是不需要中断的，此时我们在locationChange中
			  return ["magix_vf_lm"];

			假设右侧要这样渲染：
				<vframe data-view="app/views/home/a" id="vf1"></vframe>

			接收消息渲染main时：
				locChanged(先通知main有loc变化，此时已经知道main下面有vf1了)
					|
				mountMainView(渲染main)
					|
				unmountMainView(清除以前渲染的)
					|
				unmountVf1View(清除vf1)
					|
				mountVf1View(main渲染完成后渲染vf1)
					|
				locChangedToA(继续上面的循环到Vf1)

				error;
			方案：
				0.3版本中采取的是在mount某个view时，先做销毁时，直接把下面的子view递归出来，一次性销毁，但依然有问题，销毁完，再渲染，此时消息还要向后走（看了0.3的源码，这块理解的并不正确）

				0.3把块放在view中了，在vom中取出vframe，但这块的职责应该在vframe中做才对，view只管显示，vframe负责父子关系
		 */
		if(view&&view.exist&&view.rendered){//存在view时才进行广播，对于加载中的可在加载完成后通过调用view.getLocation()拿到对应的window.location.href对象，对于销毁的也不需要广播
			var isChanged=safeExec(view.testObserveLocationChanged,e,view);
			if(isChanged){//检测view所关注的相应的参数是否发生了变化
				//safeExec(view.render,[],view);//如果关注的参数有变化，默认调用render方法
				//否定了这个想法，有时关注的参数有变化，不一定需要调用render方法
				var res=safeExec(view.locationChange,e,view);
			}
			if(res!==false){//不为false继续向子vframe传递消息
				if(!Magix.isArray(res)){
					res=me.children;
				}
				for(var i=0,j=res.length,vf;i<j;i++){
					vf=me.owner.getVframe(res[i]);
					if(vf){
						safeExec(vf.notifyLocationChange,e,vf);
					}
				}
			}
		}
	},
	/**
	 * 通知所有的子view创建完成
	 */
	notifyChildrenCreated:function(){
		var me=this;
		var fn=function(){
			var view=me.view;
			if(view){
				safeExec(view.trigger,ChildrenCreated,view);
			}
			console.log(me.id+' notifyChildrenCreated');
			me.trigger(ChildrenCreated);
		}
		if(me.viewCreated)fn();
		else me.bind(ViewLoad,fn);
	}
	/**
	 * view加载完成时触发
	 * @name Vframe#viewLoad 
	 * @event
	 * @param {Object} e view加载完成后触发
	 * @param {Object} e.view 加载的view对象
	 */
});