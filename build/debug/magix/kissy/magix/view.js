/**
 * @fileOverview view类
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/view',function(S,IView,Magix,Event){
	var counter=1;
var safeExec=Magix.safeExec;
var HAS=Magix.hasProp;
var EMPTY='';
/**
 * View类
 * @name View
 * @class
 * @constructor
 * @borrows Event.bind as this.bind
 * @borrows Event.trigger as this.trigger
 * @borrows Event.unbind as this.unbind
 * @param {Object} ops 创建view时，需要附加到view对象上的其它属性
 * @property {Object} events 事件对象
 * @property {Boolean} exist 标识当前view是否存在，有没有被销毁
 * @property {String} id 当前view与页面vframe节点对应的id
 * @property {Vframe} owner 拥有当前view的vframe对象
 * @property {String} template 当前view对应的模板字符串(当hasTemplate不为false时)，该属性在created事件触发后才存在
 * @example
 * 关于View.prototype.events:
 * 示例：
 *   html写法：
 *   
 *   &lt;input type="button" mxclick="test:100@id:xinglie@name" value="test" /&gt;
 *   &lt;a href="http://etao.com" mxclick="test:etao.com:_prevent_"&gt;http://etao.com&lt;/a&gt;
 *
 * 	 view写法：
 * 	 
 *   events:{
 *   	click:{
 *   		test:function(e){
 *   			//e.view  当前view对象
 *   			//e.currentId 处理事件的dom节点id
 *   			//e.targetId 触发事件的dom节点id
 *   			//e.events  view.events对象，可访问其它事件对象，如：e.events.mousedown.test
 *   			//e.params  传递的参数
 *   			//如果在html上写：mxclick="test:etao.com:_prevent_"，用冒号分割的一个字符串，第1个冒号前的表示要调用的方法。当最后一个是_prevent_（调用e.preventDefault）,_stop_（调用e.stopPropagation）,_halt_（阻止默认行为和冒泡）时，丢弃最后一个，把etao.com做为参数传入，可以用e.params[0]获取
 *   			//如果是mxclick="test:100@id:xinglie@name"时，可以用e.params.id e.params.name取得相应的值，这样更直观些
 *   		}
 *   	},
 *   	mousedown:{
 *   		test:function(e){
 *   			
 *   		}
 *   	}
 *   }
 */
var WrapAsyncUpdateNames=['render','renderUI','updateUI'];

var View=function(ops){
	var me=this;
	Magix.mix(me,ops);
	me.exist=true;
	me.iQ=[];
	me.iC=0;
	me.sign=0;//标识view是否刷新过，对于托管的函数资源，在回调这个函数时，不但要确保view没有销毁，而且要确保view没有刷新过，如果刷新过则不回调
};
var BaseViewProto=View.prototype;
var WrapKey='~~';
var WrapFn=function(fn,update){
	return function(){
		var me=this;
		var args=arguments;
		me.idle(function(){
			if(update){
				me.sign++;
			}
			//
			fn.apply(me,args);
		});
	}
};
/*
	var cases=[
	    'xx\n return ;',
	    'return a',
	    'return {',
	    'return  \r\n',
	    'return{',
	    'return(',
	    'return[',
	    'return   {',
	    'return      [',
	    'return    (',
	    'return;',
	    'return\r\n',
	    'return/\\s+/',
	    'var returned',
	    'xreturn a',
	    'return ""',
	    'return""',
	    'return\'\'',
	    'return \'\''
	];
 */
var ReturnedReg=/(?:^|\s)return(?:(?:\s+[+\-\w$'"{\[\(\/])|[+\-{\[\(\/'"])/;
var FnBodyReg=/{([\s\S]+)}/;
var TransReg=/\\[\s\S]/g;
var LS=/\s*\/\s*/g;
var SpaceReg=/^[\s\xa0\u3000\uFEFF]*$/;
var Trims=[
	/[^\w$_]\/[\s\S]*?\//,//简单识别正则
	/(?:'[^']*')|(?:"[^"]*")/,//简单识别字符串
	/{[^{}]+}/ //简单识别大括号
]
/*
	识别函数有没有返回值
	思路：
		考虑这样的函数：
		function test(){
			function inner(){
				return true;
			}
			var r=inner();
		}
	我们不能简单判断函数体内是否有return，考虑上面的函数，有可能里面内部的函数有return 外面的没有return
	解决办法是把函数体拿出来
	去掉所有成对出现的{}及它们之间的内容
	然后再识别剩下的是否有return

	function test(){
		function a(){
			return 'xxx{'
		}
		var e;
	}

	像上面的这种其实会识别错误，但这样的情况出现的很少
	也不是所有的方法都需要进行idle包装，因此忽略

	2012.11.22
	对于上面的情况，我们最好修正下，防止隐患
	修改方案为：
	先去掉 \后跟的字符，去掉转义的（这样也会去掉正则里面的）
	去除字符串
	去除大括号
	最后判断

	Y的 还有个正则

	function(){
		function a(){
		  var a=/\r\n\\"\//;
			return '\r\n\\\' return xxx{'
		}
		var e;
	}

	把正则跟字符串一起处理了
 */
var ReturnedSthOrEmpty=function(fn){
	fn=String(fn);
	var body=fn.match(FnBodyReg);
	if(body){
		body=body[1];
		if(SpaceReg.test(body))return true;
		body=body.replace(TransReg,EMPTY).replace(LS,EMPTY);
		for(var i=0,reg;i<Trims.length;i++){
			reg=Trims[i];
			while(reg.test(body)){
				body=body.replace(reg,EMPTY);
			}
		}
		return ReturnedReg.test(body);
	}
	return false;
};
Magix.mix(View,{
	/**
	 * @lends View
	 */
	/**
	 * 给dom节点添加id
	 * @param {HTMLElement} dom html节点
	 * @return {String} 节点id
	 */
	idIt:function(dom){
		return dom.id||(dom.id='magix_mxe_'+(counter++));
	},
	/**
	 * 对异步更新view的方法进行一次包装
	 */
	wrapAsyncUpdate:function(){
		var view=this;
		if(!view[WrapKey]){//只处理一次
			view[WrapKey]=1;
			var prop=view.prototype;
			var old;
			view.registerAsyncUpdateName();
			for(var p in prop){
				old=prop[p];
				var wrap=null;
				//包装function时，需要规避有返回内容的函数，有返回的通常都需要同步调用，因此不能包装
				if(Magix.isFunction(old)&&old!=Magix.noop&&!old[WrapKey]&&!ReturnedSthOrEmpty(old)){
					if(HAS(view.$ans,p)){
						wrap=WrapFn(old,true);
					}else if(HAS(prop,p)&&!HAS(BaseViewProto,p)){//对继承的原型上的方法进行处理，不对基类里面的处理
						wrap=WrapFn(old);
					}
					if(wrap){
						wrap[WrapKey]=old;
						prop[p]=wrap;
					}
				}
			}
		}
	},
	/**
	 * 注册view类中哪些方法是异步更新的方法，默认已注册render renderUI updateUI三个方法
	 * @param {Array|String} names 方法名字符串或字符串数组
	 * @see View#beginAsyncUpdate
	 */
	registerAsyncUpdateName:function(names){
		var me=this;
		if(!me.$ans){
			me.$ans={};
			for(var i=0;i<WrapAsyncUpdateNames.length;i++){
				me.$ans[WrapAsyncUpdateNames[i]]=true;
			}
		}
		if(names){
			if(!Magix.isArray(names))names=[names];
			for(var i=0;i<names.length;i++){
				me.$ans[names[i]]=true;
			}
		}
		return me;
	}
});

var UnsupportBubble={
	blur:1,
	focus:1,
	focusin:1,
	focusout:1,
	mouseenter:1,
	mouseleave:1,
	mousewheel:1,
	valuechange:1
};
var VProto=View.prototype;
var D=document;
var WIN=window;
var DestroyManagedTryList=['abort','stop','cancel','destroy','dispose'];
var $=function(id){
	return typeof id=='object'?id:D.getElementById(id);
};

Magix.mix(VProto,Event);

Magix.mix(VProto,{
	/**
	 * @lends View#
	 */
	/**
	 * 使用xhr获取当前view对应的模板内容，仅在开发app阶段时使用，打包上线后html与js打包在一起，不会调用这个方法
	 * @function
	 * @param {String} path 路径
	 * @param {Function} fn 获取完成后的回调
	 */
	getTmplByXHR:Magix.unimpl,
	/**
	 * 代理不冒泡的事件
	 * @function
	 */
	delegateUnbubble:Magix.unimpl,
	/**
	 * 取消代理不冒泡的事件
	 * @function
	 */
	undelegateUnbubble:Magix.unimpl,
	/**
	 * 渲染view，供最终view开发者覆盖
	 * @function
	 */
	render:Magix.noop,
	/**
	 * 当window.location.href有变化时调用该方法（如果您通过observeLocation指定了相关参数，则这些相关参数有变化时才调用locationChange，否则不会调用），供最终的view开发人员进行覆盖
	 * @function
	 * @param {Object} e 事件对象
	 * @param {Object} e.location window.location.href解析出来的对象
	 * @param {Object} e.changed 包含有哪些变化的对象
	 */
	locationChange:Magix.noop,
	/**
	 * 用于接受其它view通过postMessageTo方法发来的消息，供最终的view开发人员进行覆盖
	 * @function
	 * @param {Object} e 通过postMessageTo传递的第二个参数
	 */
	receiveMessage:Magix.noop,
	/**
	 * 初始化方法，供最终的view开发人员进行覆盖，注意：不要在该方法内进行异步数据获取，init仅适用于事件绑定等(init何时被调用？init在view进行一系列的初始化后，在view的created事件后被调用，此时已完成界面的创建。为什么要设计的这么靠后？view没被创建出来前，是不能做其它动作的，如果在此之前调用了init，而用户可以在init中做其它的动作，假设view还未创建完成就销毁，会给销毁带来一定的麻烦)
	 * @function
	 */
	init:Magix.noop,
	/**
	 * 标识当前view是否有模板文件
	 * @default true
	 */
	hasTemplate:true,
	/**
	 * 是否启用DOM事件(events对象指定的事件是否生效)，注意：如果初始化时就为false则不注册代理事件，后续无法通过enableEvent=true启用事件。
	 * @default true
	 * @example
	 * 该属性在做浏览器兼容时有用：支持pushState的浏览器阻止a标签的默认行为，转用pushState，不支持时直接a标签跳转，view不启用事件
	 * Q:为什么不支持history state的浏览器上还要使用view？
	 * A:考虑 http://etao.com/list?page=2#!/list?page=3; 在IE6上，实际的页码是3，但后台生成时候生成的页码是2，<br />所以需要magix/view载入后对相应的a标签链接进行处理成实际的3。用户点击链接时，由于view没启用事件，不会阻止a标签的默认行为，后续才是正确的结果
	 */
	enableEvent:true,
	/**
	 * view刷新时是否采用动画
	 * @type {Boolean}
	 */
	enableRefreshAnim:false,
	/**
	 * 加载view内容
	 */
	load:function(){
		var me=this;
		//if(me.$loaded)return;
		//me.$loaded=true;
		var ready=function(){
			//me.owner.owner.suspend();
			me.suspend();
			/*
				挂起后render方法无法立即执行
			 */
			safeExec(me.render,[],me);
			/*
				为什么要挂起？下面的代码为什么要放在idle的回调里面？

				<vframe id="magix_vf_root">
					<## <vframe id="magix_vf_1" data-view="..."></vframe> ##>
				</vframe>
				
				<## ##>表示是magix_vf_root的view载入后，通过setViewHTML添加的

				在magix_vf_root的render中，如果要调用postMessageTo向vf_1发消息，vf_1接受不到，因为set完后，Vframe还没有建立起相应的vframe对象：
				
				用户重写了render方法：

					代理冒泡事件
					    |
					通知准备完成（vframe接收，有模板时见@1，如果view无模板时见@2）
					    |
					调用init初始化
					    |
					调用render方法（有可能调用setViewHTML方法）
					    |
					调用下面的匿名函数（函数内有判断是否调用了setViewHTML方法）

				@1 用户重写了render方法后，vframe接收ready事件：
					
					ready
					    |
					加载子view(此时尚未有内容，所以暂时找不到子view)
					    |
					绑定prerender与rendered事件
					    |
					当view调用setViewHTML方法后则后续正常执行
				
				@2
				     ready
				        |
				     加载子view（模板在页面上，所以会执行，有子view时则加载）
				        |
				     绑定prerender与rendered事件

				用户未重写render方法：
					
					调用render空方法
					    |
					代理冒泡事件
					    |
					通知创建完成（vframe接收，有模板时见@1，如果view无模板时见@2）
					    |
					调用init初始化
					    |
					调用下面的匿名函数（函数内有判断是否调用了setViewHTML方法）

				如果在view render中要访问其它vframe时，应放在idle回调内，如：

				me.idle(funciton(){
					VOM.getVframe('magix_vf_2');
				});

				其它常用方法如postMessageTo则不需要放在idle的回调内（view中已处理）


				以上是对于有缓存的view，比如调用render方法时，是同步渲染出来的。

				#2012.11.25
				  cache:ready->(vframe.loadSubVframes)->render(postMessage,idle)->setViewHTML->(prerender,rendered)->(unload,loadSubVframes)->resume;
				  nocache:ready->(vframe.loadSubVframes)->render(async back[postMessage idle])->resume()
				          tmplReady->setViewHTML->(prerender,rendered)->(unload,loadSubVframes)->postMessage idle

			 */
			me.delegateBubbleEvents();
			me.idle(function(){
				//
				if(!me.rendered){//监视有没有在调用render方法内使用setViewHTML更新view，对于没有模板的view，是不需要调用的，此时我们需要添加不冒泡的事件处理，如果调用了，则在setViewHTML中处理，首次就不再处理了，只有冒泡的事件才适合在首次处理
					me.delegateUnbubbleEvents();
					me.rendered=true;
				}
				safeExec(me.init,[],me);
				me.trigger('created',null,true);//先注册的事件先调用
				var mxConfig=Magix.config();
				var fn=mxConfig.viewLoad;
				if(Magix.isFunction(fn)){
					safeExec(fn,{name:me.viewName,location:me.getLocation()});
				}
			});
			me.trigger('ready',{tmpl:me.hasTemplate},true);//已就绪
			me.resume();
			//me.owner.owner.resume();
		};
		if(me.hasTemplate){
			me.getTemplate(me.manage(function(tmpl){//模板获取也是异步的，防止模板没取回来时，view已经销毁或刷新了
				me.template=tmpl;
				ready();
			}));
		}else{
			ready();
		}
	},
	/**
	 * 更新view的id，在启用动画的情况下，内部会做id转换
	 */
	updateViewId:function(){
		var me=this;
		if($(me.vId)){
			me.id=me.vId;
		}else{
			me.id=me.vfId;
		}
	},
	/**
	 * 设置view节点的html内容，供子类重写
	 * @param {Strig} html html字符串
	 */
	setNodeHTML:function(html){
		var me=this;
		$(me.id).innerHTML=html;
	},
	/**
	 * 设置view的html内容
	 * @param {Strig} html html字符串
	 */
	setViewHTML:function(param){
		var me=this;
		if(me.exist){
			me.trigger('refresh',null,true,true);//从最后注册的事件一直清到最先注册的事件
			var mxConfig=Magix.config();
			

			var enableAnim=mxConfig.viewChangeAnim&&me.rendered&&me.enableRefreshAnim;//渲染过才使用动画

			me.trigger('prerender',{anim:enableAnim});

			//
			me.destroyManaged(true);
			me.undelegateUnBubbleEvents();
			me.destroyFrames();
			

			var owner=me.owner;
			if(enableAnim){
				safeExec(owner.oldViewDestroy,[],owner);
				safeExec(owner.prepareNextView,[],owner);
				me.updateViewId();
			}
			if(!me.rendered){
				me.$bakHTML=$(me.id).innerHTML;
			}

			me.setNodeHTML(param);

			if(enableAnim){
				safeExec(owner.newViewCreated,[],owner);
			}
			me.delegateUnbubbleEvents();
			me.rendered=true;
			me.trigger('rendered');//可以在rendered事件中访问view.rendered属性
		}
	},
	/**
	 * 向某个view发送消息
	 * @param {Array|String} aim  发送的目标id或id数组
	 * @param {Object} args 消息对象
	 */
	postMessageTo:function(aim,args){
		var me=this;
		me.idle(me.owner.postMessageTo,[aim,args],me.owner);
	},
	/**
	 * 当view处于闲置状态时回调传入的fn
	 * @param {Function} fn 闲置时的回调函数
	 * @param {Array} [args] 参数
	 * @param {Object} [context] fn内this指向
	 * @example
	 * //idle的应用场景：
	 *
	 * update:function(){
	 * 		var loc=this.getLocation();
	 * 		
	 * }
	 * //...
	 * click:{
	 * 		create:function(e){
	 * 			Router.navigate({a:'b',c:'d'});//此处的更改是异步的
	 * 			e.view.update();//在0.3版的magix中，这样写在update方法内无法立即得到a的值
	 * 		}
	 * }
	 * //上面create中安全的使用方式是这样的：
	 * Router.navigate({a:'b',c:'d'});
	 * e.view.idle(function(){
	 * 		e.view.update();
	 * });
	 *
	 * //但是这样的书写明显会带来不方便，需要开发者明白哪些地方是异步的，哪些地方是同步的
	 * //所以view会对原型链上的方法进行一次处理，magix 1.0版自动帮你包装一下相关的方法，包装后：
	 *
	 * Router.navigate({a:'b',c:'d'});
	 * e.view.update();//此update是包装后的方法，会等到Router修改完成url后才调用
	 *
	 * //view在包装原型链上的方法时，对明确有返回值的方法不进行包装
	 * //因此下面的情景并不能自动处理，您需要手动判断：
	 *
	 * getParams:function(){
	 * 		var loc=this.getLocation();
	 * 		//...
	 * 		return newLocParams;//该方法有返回值，无法异步调用
	 * }
	 * //...
	 * click:{
	 * 		create:function(e){
	 * 			Router.navigate({a:'b',c:'d'});//此处的更改是异步的
	 * 			var params=e.view.getParams();//无法在getParams方法内部拿到最新的a和c的值
	 * 			//对于上面这一行需要修改成：
	 * 			e.view.idle(function(){
	 * 				var params=e.view.getParams();
	 * 			});
	 * 			//对于getParams方法如果内部没有访问location也是不需要在idle回调中执行的
	 * 			
	 * 		}
	 * }
	 *
	 * //magix已经尽最大可能解决掉了异步问题，而在项目中一般很少出现上面的情景
	 * //因此您不需要考虑每个动作都放在idle里面，出现问题了再考虑
	 *
	 * //在方法内如果没有访问location也是不需要在idle回调中执行的
	 * //忘掉这个方法的存在吧~~
	 *
	 * //
	 */
	idle:function(fn,args,context){
		var me=this;
		if(me.iC){
			me.iQ.push([fn,args,context]);
		}else{
			me.ownerVOM.idle(function(){//在应用中，有可能是在异步中回调，为了防止应用中没有做判断，所以在此做下判断，只有view存在的情况下才调用
				if(me.exist&&Magix.isFunction(fn)){
					safeExec(fn,args,context);
				}
			});
		}
	},
	/**
	 * 获取window.location.href解析后的对象
	 * @return {Object}
	 */
	getLocation:function(){
		var me=this;
		return me.ownerVOM.$location;
	},
	/**
	 * 指定要监视地址栏中的哪些值有变化时，当前view的locationChange才会被调用。通常情况下location有变化就会引起当前view的locationChange被调用，但这会带来一些不必要的麻烦，所以你可以指定地址栏中哪些值有变化时才引起locationChange调用，使得view只关注与自已需要刷新有关的参数
	 * @param {Array|String} keys            key数组或字符串
	 * @param {Boolean} observePathname 是否监视pathname
	 * @example
	 * return View.extend({
	 * 		init:function(){
	 * 			this.observeLocation('page,rows',true);//关注地址栏中的page rows2个参数的变化，并且关注pathname的改变，当其中的任意一个改变时，才引起当前view的locationChange被调用
	 * 		},
	 * 		locationChange:function(location,changed){
	 * 			if(changed.isParamChanged('page')){};//检测是否是page发生的改变
	 * 			if(changed.isParamChanged('rows')){};//检测是否是rows发生的改变
	 * 			if(changed.isPathnameChanged()){};//是否是pathname发生的改变
	 * 		}
	 * });
	 */
	observeLocation:function(keys,observePathname){//区分params与pathname
		var me=this;
		var args=arguments;
		if(args.length==1){
			observePathname=false;
		}
		if(args.length){
			me.$location={
				keys:Magix.isArray(keys)?keys:String(keys).split(','),
				pathname:observePathname
			};
		}
	},
	/**
	 * 检测通过observeLocation方法指定的key对应的值有没有发生变化
	 * @param {Object} e Router.locationChanged事件对象
	 * @return {Boolean} 是否发生改变
	 */
	testObserveLocationChanged:function(e){
		var me=this;
		var location=me.$location;
		var loc=e.changed;
		if(location){
			var res=false;
			if(location.pathname){
				res=loc.isPathnameChanged(location.pathname);
			}
			if(!res){
				var keys=location.keys;
				for(var i=0;i<keys.length;i++){
					var key=keys[i];
					if(loc.isParamChanged(key)){
						res=true;
						break;
					}
				}
			}
			return res;
		}
		return true;
	},
	/**
	 * 销毁当前view内的iframes 
	 */
	destroyFrames:function(){
		var me=this;
		var node=$(me.id),
			iframes=node.getElementsByTagName('iframe'),
			iframe, parent;
        while (iframes.length) {
            iframe = iframes[0];
            parent = iframe.parentNode;
            iframe.src = EMPTY; // 似乎是关键步骤
            parent.removeChild(iframe);
            //parent.parentNode.removeChild(parent);
            iframe = parent = null;
        }
        if(WIN.CollectGarbage){
        	WIN.CollectGarbage();
        }
	},
	/**
	 * 销毁当前view
	 * @param {Boolean} [keepContent] 销毁view时，是否保留内容，默认对于有模板的view才删除内容，没有模板的是不做删除处理的
	 */
	destroy:function(keepContent){
		var me=this;
		me.trigger('refresh',null,true,true);//先清除绑定在上面的app中的刷新
		me.trigger('destroy',null,true,true);//同上
		me.destroyManaged();
		me.undelegateUnBubbleEvents();
		me.undelegateBubbleEvents();
		if(me.hasTemplate&&!keepContent){
			me.destroyFrames();
			//
			$(me.vfId).innerHTML=me.$bakHTML||EMPTY;
		}
		//me.unbind('prerender',null,true); 销毁的话也就访问不到view对象了，这些事件不解绑也没问题
		//me.unbind('rendered',null,true);
		me.exist=false;
		me.iQ=[];
		me.sign++;
		//
	},
	/**
	 * 获取当前view对应的模板
	 * @param {Function} fn 取得模板后的回调方法
	 */
	getTemplate:function(fn){
		var me=this;
		if(me.template){
			fn(me.template);
		}else{
			var tmpl=Magix.templates[me.viewName];
			if(tmpl){
				fn(tmpl);
			}else{
				var mxConfig=Magix.config();
				var isReleased=mxConfig.release;

				var path=mxConfig.appHome+me.viewName+'.html';
				if(!isReleased){
					path+='?_='+new Date().getTime();
				}
				me.getTmplByXHR(path,function(tmpl){
					fn(Magix.templates[me.viewName]=tmpl);
				});
			}
		}
	},
	/**
	 * 处理dom事件
	 * @param {Event} e dom事件对象
	 */
	processEvent:function(e){
		var me=this;
		if(me.enableEvent&&me.exist){
			var target=e.target;
			var current=target;
			while(current.nodeType!=1){
				current=current.parentNode;
			}
			var type='mx'+e.type;
			var info=current.getAttribute(type);
			var node=$(me.vfId);

			while(!info&&current!=node){
				current=current.parentNode;
				info=current.getAttribute(type);
			}
			if(info){
				var infos=info.split(':');
				var evtName=infos.shift();
				var flag=infos[infos.length-1];
				var needPop;
				var id=View.idIt(current);
				if(flag=='_halt_'||flag=='_stop_'){
					e.stopPropagation();
					needPop=true;
				}
				if(flag=='_halt_'||flag=='_prevent_'){
					e.preventDefault();
					needPop=true;
				}
				if(needPop)infos.pop();

				var events=me.events;
				var eventsType=events[e.type];
				//
				for(var i=0,atPos;i<infos.length;i++){
					atPos=infos[i].lastIndexOf('@');
					if(atPos>-1){
						infos[infos[i].substring(atPos+1)]=infos[i].substring(0,atPos);
					}
				}
				if(eventsType[evtName]){
					safeExec(eventsType[evtName],{
						view:me,
						currentId:id,
						targetId:View.idIt(target),
						domEvent:e,
						events:events,
						params:infos
					},eventsType);
					//e.stopPropagation();
				}
			}
		}
	},
	/**
	 * 修正dom事件对象，主要是对IE的修正，添加如target preventDefault等
	 * @param {event} e dom事件对象
	 * @return {event} dom事件对象
	 */
	fixedEvent:function(e){
		if(!e)e=WIN.event;
		if(e){
			if(!e.stopPropagation){
				e.stopPropagation=function(){
					e.cancelBubble=true;
				}
			}
			if(!e.preventDefault){
				e.preventDefault=function(){
					e.returnValue=false;
				}
			}
			if(e.srcElement&&!e.target){
				e.target=e.srcElement;
			}
		}
		return e;
	},
	/**
	 * 处理代理事件
	 * @param {Boolean} bubble  是否冒泡的事件
	 * @param {Boolean} dispose 是否销毁
	 */
	processDelegateEvents:function(bubble,dispose){
		var me=this;
		var viewName=me.viewName;
		if(me.enableEvent){
			var events=me.events;
			var node=$(me.vfId);
			if(me.$bubbleList&&me.$unbubbleList){
				var list=bubble?me.$bubbleList:me.$unbubbleList;
				for(var i=0;i<list.length;i++){
					if(bubble){
						if(dispose){
							node['on'+list[i]]=null;
						}else{
							node['on'+list[i]]=function(e){
								//
								e=me.fixedEvent(e);
								me.processEvent(e);
							}
						}
					}else{
						if(dispose){
							me.undelegateUnbubble(node,list[i]);
						}else{
							me.delegateUnbubble(node,list[i]);
						}
					}
				}
			}else{
				me.$bubbleList=[];
				me.$unbubbleList=[];
				for(var p in events){
					if(HAS(events,p)){
						if(HAS(UnsupportBubble,p)){
							me.$unbubbleList.push(p);
							if(!bubble){
								if(dispose){
									me.undelegateUnbubble(node,p);
								}else{
									me.delegateUnbubble(node,p);
								}
							}
						}else{
							me.$bubbleList.push(p);
							if(bubble){
								if(dispose){
									node['on'+p]=null;
								}else{
									node['on'+p]=function(e){
										//

										e=me.fixedEvent(e);
										me.processEvent(e);
									}
								}
							}
						}
					}
				}
			}
		}
	},
	/**
	 * 代理dom冒泡事件
	 */
	delegateBubbleEvents:function(){
		this.processDelegateEvents(true);
	},
	/**
	 * 代理dom不冒泡事件
	 */
	delegateUnbubbleEvents:function(){
		this.processDelegateEvents()
	},
	/**
	 * 取消代理dom不冒泡事件
	 */
	undelegateUnBubbleEvents:function(){
		this.processDelegateEvents(false,true);
	},
	/**
	 * 取消代理dom冒泡事件
	 */
	undelegateBubbleEvents:function(){
		this.processDelegateEvents(true,true);
	},
	/**
	 * 让view帮你管理资源，对于异步回调函数更应该调用该方法进行托管
	 * 当调用该方法后，您不需要在异步回调方法内判断当前view是否已经销毁
	 * 同时对于view刷新后，上个异步请求返回刷新界面的问题也得到很好的解决。<b>强烈建议对异步回调函数，组件等进行托管</b>
	 * @param {String|Object} key 托管的资源或要共享的资源标识key
	 * @param {Object} [res] 要托管的资源
	 * @return {Object} 返回传入的资源，对于函数会自动进行一次包装
	 * @example
	 * init:function(){
	 * 		this.manage('user_list',[//管理对象资源
	 * 			{id:1,name:'a'},
	 * 			{id:2,name:'b'}
	 * 		]);
	 * },
	 * render:function(){
	 * 		var _self=this;
	 * 		var m=new Model();
	 * 		m.load({
	 * 			success:_self.manage(function(resp){//管理匿名函数
	 * 				//TODO
	 * 				var brix=new BrixDropdownList();
	 *
	 * 				_self.manage(brix);//管理组件
	 *
	 * 				var pagination=_self.manage(new BrixPagination());//也可以这样
	 *
	 * 				var timer=_self.manage(setTimeout(function(){
	 * 					S.log('timer');
	 * 				},2000));//也可以管理定时器
	 *
	 * 				
	 * 				var userList=_self.getManaged('user_list');//通过key取托管的资源
	 *
	 * 				S.log(userList);
	 * 			}),
	 * 			error:_self.manage(function(msg){
	 * 				//TODO
	 * 			})
	 * 		})
	 * }
	 */
	manage:function(key,res){
		var me=this;
		var args=arguments;
		var hasKey=true;
		if(args.length==1){
			res=key;
			key='res_'+(counter++);
			hasKey=false;
		}
		if(!me.$resCache)me.$resCache={};
		var wrapObj={
			hasKey:hasKey,
			res:res
		};
		if(Magix.isFunction(res)){
			res=me.wrapManagedFunction(res);
			wrapObj[me.sign]=res;
		}
		me.$resCache[key]=wrapObj;
		return res;
	},
	/**
	 * 获取托管的资源
	 * @param {String} key 托管资源时传入的标识key
	 * @return {[type]} [description]
	 */
	getManaged:function(key){
		var me=this;
		var cache=me.$resCache;
		var sign=me.sign;
		if(cache&&HAS(cache,key)){
			var wrapObj=cache[key];
			var resource=wrapObj.res;
			if(Magix.isFunction(resource)){//托管的是方法，取出用时，依然要考虑view刷新问题，当view刷新后，这个方法是需弃用的
				if(!wrapObj[sign]){
					wrapObj[sign]=me.wrapManagedFunction(resource);
				}
				resource=wrapObj[sign];
			}
			return resource;
		}
		return null;
	},
	/**
	 * 移除托管的资源
	 * @param {String|Object} param 托管时标识key或托管的对象
	 */
	removeManaged:function(param){
		var me=this;
		var cache=me.$resCache;
		if(cache){
			if(HAS(cache,param)){
				delete cache[param];
			}else{
				for(var p in cache){
					if(cache[p].res===param){
						delete cache[p];
						break;
					}
				}
			}
		}
	},
	/**
	 * 销毁托管的资源
	 * @param {Boolean} [byRefresh] 是否是刷新时的销毁
	 */
	destroyManaged:function(byRefresh){
		var me=this;
		var cache=me.$resCache;
		//
		if(cache){
			for(var p in cache){
				var o=cache[p];
				var processed=false;
				var res=o.res;
				if(Magix.isNumber(res)){//数字，有可能是定时器
					WIN.clearTimeout(res);
					WIN.clearInterval(res);
					processed=true;
				}else if(res){
					for(var i=0;i<DestroyManagedTryList.length;i++){
						if(Magix.isFunction(res[DestroyManagedTryList[i]])){
							safeExec(res[DestroyManagedTryList[i]],[],res);
							processed=true;
							//不进行break,比如有时候可能存在abort 和  destroy
						}
					}
				}
				me.trigger('destroyResource',{
					resource:res,
					processed:processed
				});
				if(byRefresh&&!o.hasKey){//如果是刷新且托管时没有给key值，则表示这是一个不会在其它方法内共享托管的资源，view刷新时可以删除掉
					delete cache[p];
				}
			}
			if(!byRefresh){//如果不是刷新，则是view的销毁
				me.unbind('destroyResource');
				delete me.$resCache;
			}
		}
	},
	/**
	 * 包装托管的函数
	 * @param {Function} fn 托管的函数
	 * @return {Function}   包装后的函数
	 */
	wrapManagedFunction:function(fn){
		var me=this;
		var sign=me.sign;
		return function(){
			//
			if(me.sign==sign){
				safeExec(fn,arguments,me);
			}
		}
	},
	/**
	 * 当您采用setViewHTML方法异步更新html时，通知view做好异步更新的准备，<b>注意:该方法最好和manage，setViewHTML一起使用。当您采用其它方式异步更新整个view的html时，仍需调用该方法</b>，建议对所有的异步更新回调使用manage方法托管，对更新整个view html前，调用beginAsyncUpdate进行更新通知
	 * @example
	 * // 什么是异步更新html？
	 * render:function(){
	 * 		var _self=this;
	 * 		var m=new Model({uri:'user:list'});
	 * 		m.load({
	 * 			success:_self.manage(function(data){
	 * 				var html=Mu.to_html(_self.template,data);
	 * 				_self.setViewHTML(html);
	 * 			}),
	 * 			error:_self.manage(function(msg){
	 * 				_self.setViewHTML(msg);
	 * 			})
	 * 		})
	 * }
	 *
	 * //如上所示，当调用render方法时，render方法内部使用model异步获取数据后才完成html的更新则这个render就是采用异步更新html的
	 *
	 * //异步更新带来的问题：
	 * //view对象监听地址栏中的某个参数，当这个参数发生变化时，view调用render方法进行刷新，因为是异步的，所以并不能立即更新界面，
	 * //当监控的这个参数连续变化时，view会多次调用render方法进行刷新，由于异步，你并不能保证最后刷新时发出的异步请求最后返回，
	 * //有可能先发出的请求后返回，这样就会出现界面与url并不符合的情况，比如tabs的切换和tabPanel的更新，连续点击tab1 tab2 tab3 
	 * //会引起tabPanel这个view刷新，但是异步返回有可能3先回来2最后回来，会导致明明选中的是tab3，却显示着tab2的内容
	 * //所以要么你自已在回调中做判断，要么把上面的示例改写成下面这样的：
	 * 	render:function(){
	 * 		var _self=this;
	 * 		_self.beginAsyncUpdate();//开始异步更新
	 * 		var m=new Model({uri:'user:list'});
	 * 		m.load({
	 * 			success:_self.manage(function(data){
	 * 				var html=Mu.to_html(_self.template,data);
	 * 				_self.setViewHTML(html);
	 * 			}),
	 * 			error:_self.manage(function(msg){
	 * 				_self.setViewHTML(msg);
	 * 			})
	 * 		});
	 * 		_self.endAsyncUpdate();//结束异步更新
	 * }
	 * //其中endAsyncUpdate是备用的，把你的异步更新的代码放begin end之间即可
	 * //当然如果在每个异步更新的都需要这样写的话来带来差劲的编码体验，所以View会对render,renderUI,updateUI三个方法自动进行异步更新包装
	 * //您在使用这三个方法异步更新html时无须调用beginAsyncUpdate和endAsyncUpdate方法
	 * //如果除了这三个方法外你还要添加其它的异步更新方法，可调用View静态方法View.registerAsyncUpdateName来注册自已的方法
	 * //请优先考虑使用render renderUI updateUI 这三个方法来实现view的html更新，其中render方法magix会自动调用，您就考虑后2个方法吧
	 * //比如这样：
	 *
	 * renderUI:function(){//当方法名为 render renderUI updateUI时您不需要考虑异步更新带来的问题
	 * 		var _self=this;
	 * 		setTimeout(this.manage(function(){
	 * 			_self.setViewHTML(_self.template);
	 * 		}),5000);
	 * },
	 *
	 * receiveMessage:function(e){
	 * 		if(e.action=='render'){
	 * 			this.renderUI();
	 * 		}
	 * }
	 *
	 * //当您需要自定义异步更新方法时，可以这样：
	 * KISSY.add("app/views/list",function(S,MxView){
	 * 		var ListView=MxView.extend({
	 * 			updateHTMLByXHR:function(){
	 * 				var _self=this;
	 * 				S.io({
	 * 					success:_self.manage(function(html){
	 * 						//TODO
	 * 						_self.setViewHTML(html);
	 * 					})
	 * 				});
	 * 			},
	 * 			receiveMessage:function(e){
	 * 				if(e.action=='update'){
	 * 					this.updateHTMLByXHR();
	 * 				}
	 * 			}
	 * 		});
	 *   	ListView.registerAsyncUpdateName('updateHTMLByXHR');//注册异步更新html的方法名
	 * 		return ListView;
	 * },{
	 * 		requires:["magix/view"]
	 * })
	 * //当您不想托管回调方法，又想消除异步更新带来的隐患时，可以这样：
	 *
	 * updateHTML:function(){
	 * 		var _self=this;
	 * 		var begin=_self.beginAsyncUpdate();//记录异步更新标识
	 * 		S.io({
	 * 			success:function(html){
	 * 				//if(_self.exist){//不托管方法时，您需要自已判断view有没有销毁(使用异步更新标识时，不需要判断exist)
	 * 					var end=_self.endAsyncUpdate();//结束异步更新
	 * 					if(begin==end){//开始和结束时的标识一样，表示view没有更新过
	 * 						_self.setViewHTML(html);
	 * 					}
	 * 				//}
	 * 			}
	 * 		});
	 * }
	 *
	 * //顺带说一下signature
	 * //并不是所有的异步更新都需要托管，考虑这样的情况：
	 *
	 * render:function(){
	 * 		ModelFactory.fetchAll({
	 * 			type:'User_List',
	 * 			cacheKey:'User_List'
	 * 		},function(m){
	 * 			//render
	 * 		});
	 * },
	 * //...
	 * click:{
	 * 		addUser:function(e){
	 * 			var m=ModelFactory.getIf('User_List');
	 * 		 	var userList=m.get("userList");
	 * 		 	m.beginTransaction();
	 * 		 	userList.push({
	 * 		 		id:'xinglie',
	 * 		 		name:'xl'
	 * 		 	});
	 *
	 * 			m.save({
	 * 				success:function(){//该回调不太适合托管
	 * 					m.endTransaction();
	 * 					Helper.tipMsg('添加成功')
	 * 				},
	 * 				error:function(msg){//该方法同样不适合托管，当数据保存失败时，需要回滚数据，而如果此时view有刷新或销毁，会导致该方法不被调用，无法达到数据的回滚
	 * 					m.rollbackTransaction();
	 * 					Helper.tipMsg('添加失败')
	 * 				}
	 * 			})
	 * 		
	 * 		}
	 * }
	 *
	 * //以上click中的方法这样写较合适：
	 *
	 * click:{
	 * 		addUser:function(e){
	 * 			var m=ModelFactory.getIf('User_List');
	 * 		 	var userList=m.get("userList");
	 * 		 	m.beginTransaction();
	 * 		 	userList.push({
	 * 		 		id:'xinglie',
	 * 		 		name:'xl'
	 * 		 	});
	 *
	 *			var sign=e.view.signature();//获取签名
	 * 
	 * 			m.save({
	 * 				success:function(){//该回调不太适合托管
	 * 					m.endTransaction();
	 * 					if(sign==e.view.signature()){//相等时表示view即没刷新也没销毁，此时才提示
	 * 						Helper.tipMsg('添加成功')
	 * 					}		
	 * 				},
	 * 				error:function(msg){//该方法同样不适合托管，当数据保存失败时，需要回滚数据，而如果此时view有刷新或销毁，会导致该方法不被调用，无法达到数据的回滚
	 * 					m.rollbackTransaction();
	 * 					if(sign==e.view.signature()){//view即没刷新也没销毁
	 * 						Helper.tipMsg('添加失败')
	 * 					}
	 * 				}
	 * 			})
	 * 		
	 * 		}
	 * }
	 *
	 * //如果您无法识别哪些需要托管，哪些需要签名，统一使用托管方法就好了
	 */
	beginAsyncUpdate:function(){
		return this.sign++;//更新sign，@see构造函数内的注解
	},
	/**
	 * 获取view在当前状态下的签名，view在刷新或销毁时，均会更新签名。(通过签名可识别view有没有搞过什么动作)
	 * @see View#beginAsyncUpdate
	 */
	signature:function(){
		return this.sign;
	},
	/**
	 * 通知view结束异步更新html
	 * @see View#beginAsyncUpdate
	 */
	endAsyncUpdate:function(){
		return this.sign;
	},
	/**
	 * 挂起，对于初始化时，需要访问外部资源（vframe）等，需要等待外部执行完才可以访问
	 */
	suspend:function(){
		this.iC++;
	},
	/**
	 * 恢复并执行挂起的操作
	 */
	resume:function(){
		var me=this;
		if(me.iC>0){
			me.iC--;
		}
		if(!me.iC){
			var list=[].slice.call(me.iQ);
			me.iQ=[];
			while(list.length){
				var o=list.shift();
				me.idle.apply(me,o);
			}
		}
	}
	/**
	 * 当view调用setViewHTML刷新前触发
	 * @name View#prerender
	 * @event
	 * @param {Object} e
	 */
	
	/**
	 * 当view首次调用render完成渲染后触发
	 * @name View#created 
	 * @event
	 * @param {Object} e view首次调用render完成界面的创建后触发
	 */

	/**
	 * 每次调用setViewHTML更新view内容前触发，触发完该事件后即删除监听列表，如果您不需要删除监听列表，请考虑使用prerender事件，为什么设计refresh?见示例
	 * @name View#refresh
	 * @event
	 * @param {Object} e view刷新前触发
	 * @example
	 * render:function(){
	 * 		var fn=function(){};
	 * 		S.one(document).on('click',fn);
	 *      this.bind('refresh',function(){//当使用refresh事件时，您不需要考虑移除监听
	 *      	S.one(document).detach('click',fn);
	 *      });
	 *
	 * 		//如果您使用prerender事件
	 *
	 * 		this.bind('prerender',function(){
	 * 			this.unbind('prerender',arguments.callee);//您需要移除监听，要不然会越积累越多
	 * 		 	S.one(document).detach('click',fn);
	 * 		})
	 * 		
	 * }
	 */
 
	/**
	 * 每次调用setViewHTML更新view内容完成后触发
	 * @name View#rendered 
	 * @event
	 * @param {Object} e view每次调用setViewHTML完成后触发，当hasTemplate属性为false时，并不会触发该事 件，但会触发created首次完成创建界面的事件
	 */
	
	/**
	 * view销毁时触发
	 * @name View#destroy
	 * @event
	 * @param {Object} e
	 */
	
	/**
	 * view销毁托管资源时发生
	 * @name View#destroyResource
	 * @event
	 * @param {Object} e
	 * @param {Object} e.resource 托管的资源
	 * @param {Boolean} e.processed 表示view是否对这个资源做过销毁处理，目前view仅对带 abort destroy dispose方法的资源进行自动处理，其它资源需要您响应该事件自已处理
	 */
	
	/**
	 * view的所有子view包括孙view创建完成后触发，常用于要在某个view中统一绑定事件或统一做字段校验，而这个view是由许多子view组成的，通过监听该事件可知道子view什么时间创建完成
	 * @name View#childrenCreated
	 * @event
	 * @param {Object} e
	 * @example
	 * init:function(){
	 * 		this.bind('childrenCreated',function(){
	 * 			//
	 * 		})
	 * }
	 */
});
	Magix.mix(View,IView,{prototype:true});
	Magix.mix(View.prototype,IView.prototype);
	return View;
},{
	requires:["magix/impl/view","magix/magix","magix/event"]
});