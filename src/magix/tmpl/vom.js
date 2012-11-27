var D=document;

/**
 * VOM对象
 * @name VOM
 * @namespace
 */
var VOM={
	/**
	 * @lends VOM
	 */
	iC:0,
	iQ:[],
	/**
	 * 根vframe对象
	 * @type {Vframe}
	 */
	rootVframe:null,
	/**
	 * 注册的vframes集合
	 * @type {Object}
	 */
	vframes:{},
	/**
	 * 根vframe的id
	 * @default magix_vf_root
	 * @type {String}
	 */
	rootVframeId:'magix_vf_root',
	/**
	 * 注册vframe对象
	 * @param {Vframe} vf Vframe对象
	 */
	registerVframe:function(vf){
		var me=this;
		me.vframes[vf.id]=vf;
	},
	/**
	 * 根据vframe的id获取vframe对象
	 * @param {String} id vframe的id
	 * @return {Vframe} vframe对象
	 */
	getVframe:function(id){
		return this.vframes[id];
	},
	/**
	 * 删除已注册的vframe对象
	 * @param {Vframe|String} vf vframe对象或对象的id
	 */
	unregisterVframe:function(vf){
		var id=Magix.isString(vf)?vf:vf.id;
		delete this.vframes[id];
	},
	/**
	 * 构建根vframe对象
	 */
	buildRootVframe:function(){
		var me=this;
		if(!me.rootVframe){
			var rootVframeNode=D.getElementById(me.rootVframeId);
			if(!rootVframeNode){//当发现不存在的节点时，由Vframe对象负责创建
				Vframe.createVframeNode(me.rootVframeId,D.body.firstChild);
			}
			me.rootVframe=Vframe.createVframe(me.rootVframeId,{owner:me});
			me.registerVframe(me.rootVframe);
		}
	},
	/**
	 * 重新渲染根vframe
	 * @param {Object} e.location window.location.href解析出来的对象
	 * @param {Object} e.changed 包含有哪些变化的对象
	 */
	remountRootVframe:function(e){
		//console.log('mount rootVframe view',location);
		var me=this;
		me.$location=e.location;
		me.buildRootVframe();
		//console.log('rootView',location.viewPath);
		me.rootVframe.mountView(e.location.viewPath);
	},
	/**
	 * 向vframe通知地址栏发生变化
	 * @param {Object} e 事件对象
	 * @param {Object} e.location window.location.href解析出来的对象
	 * @param {Object} e.changed 包含有哪些变化的对象
	 */
	notifyLocationChange:function(e){
		var me=this;
		me.$location=e.location;
		if(me.rootVframe){
			me.rootVframe.notifyLocationChange(e);
		}
	},
	/**
	 * 当VOM处于闲置状态时回调传入的fn，当VOM忙碌时则把fn添加到等待队列
	 * @param {Function} fn 闲置时的回调函数
	 * @param {Array} [args] 参数
	 * @param {Object} [context] fn内this指向
	 */
	idle:function(fn,args,context){
		var me=this;
		//console.log('VOM.idle',fn,args,context,me.iC);
		if(me.iC){
			me.iQ.push([fn,args,context]);
		}else{
			Magix.safeExec(fn,args,context);
		}
	},
	/**
	 * 挂起VOM，等待外部的操作完成
	 */
	suspend:function(){
		var me=this;
		me.iC++;
	},
	/**
	 * 恢复挂起的VOM
	 */
	resume:function(){
		var me=this;
		if(me.iC>0){
			me.iC--;
		}
		if(!me.iC){
			var list=me.iQ;
			if(list.length){
				var tasks=[].slice.call(list);
				me.iQ=[];
				while(tasks.length){
					var o=tasks.shift();
					me.idle.apply(me,o);
				}
			}
		}
	}
}