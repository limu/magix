
Vframe = function(node, id) {
	
};
Base.mix(Vframe, {
	tagName : Base.unimpl,
	uniqueId : function() {
		return Base.uniqueId("vf-");
	},
	init : function() {
		var _ie6_tag_hack = document.createElement(this.tagName);
		_ie6_tag_hack = null;
		return this;
	}
});
Base.mix(Vframe.prototype, Base.Events);
Base.mix(Vframe.prototype, {
	getChildVframeNodes : Base.unimpl,
	getRouterObject:function(){
		return this.__Router;
	},
	/*
	 * 无法放到Vframe中，因为Vframe的tagName未实现，也不会实现，
	 * 原来的实现方案是把tagName覆盖掉，这是不正确的
	 * 模板方法类中的方法应该一直保持原样，实现类中也应该保持原样
	 * 谁也不应该被改写
	 */
	createFrame:Base.unimpl,
	getVOMObject:function(){
		return this.__VOM;
	},
	initial : function(node, id) {
		//
		this.id = "";
		this.parentNode = null;
		this.childNodes = [];
		this.mounted = false;
		//
		this._domNode = node || this.createFrame();
		this.id = this._idIt(this._domNode, id);
		if(node) {//why?
			this._domNode = null;
			node = null;
		}
		this.exist=true;
		console.log('VFrame',this);
	},
	_idIt : function(node, id) {
		node.id = (node && node.id) || id || Vframe.uniqueId();
		var _id = node.id;
		node = null;
		return _id;
	},
	getOnce : function() {
		var node = this._domNode;
		if(!node) {
			console.warn("always get once");
		}
		this._domNode = null;
		return node;
	},
	getAttribute : function(s) {
		var node = document.getElementById(this.id);
		return node.getAttribute(s) || "";
	},
	setAttribute : function(k, v) {
		var node = document.getElementById(this.id);
		return node.setAttribute(k, v);
	},
	appendChild : function(c) {
		this.childNodes.push(c);
		c.parentNode = this;
	},
	getElements : function() {
		return this.getChildVframeNodes();
	},
	handelMounted : function() {
		var me=this;
		if(me.view.rendered) {
			me.mounted = true;
			me.trigger("mounted", me.view);
			me.mountSubFrames();
		} else {
			me.view.bind("rendered", function() {
				me.mounted = true;
				me.trigger("mounted", me.view);
				me.mountSubFrames();
			});
		}
		me.view.bind("prerender",function(){
			me.destroySubFrames();
		});
	},
	mountSubFrames:function(){
		//this.trigger("beforeSubviewsRender");
		var vom=this.getVOMObject();
		var vc = vom.getElementById(this.view.vcid);
		var childVcs = vc.getElements();
		var i, child;
		for( i = 0; i < childVcs.length; i++) {
			child = vom.createElement(childVcs[i]);
			vc.appendChild(child);
			child.mountView(child.getAttribute("view_name"), {
				queryModel : this.view.queryModel
			});
		}
	},
	mountView : function(viewName, options) {
		if(!viewName) {
			return;
		}
		console.log(this.view);
		options = options || {};

		this.unmountView(options);//先清view

		/*if(this.view) {
			this.view.destroy();
		}*/
		//
		var self = this,router=this.getRouterObject();
		
		if(!options.queryModel){//确保每个view都有queryModel，请参考View的initial方法
			options.queryModel=router.queryModel;
		}
		//
		Base.requireAsync(viewName, function(View) {
			if(self.exist){
				console.log(View,View.toString());
				options.vcid = self.id;
				options.viewName = viewName;
				//options.el = self.id;
				//options.id = self.id;
				self.view = new View(options);
				self.__viewLoaded=true;
				self.trigger('viewLoaded',true);
				//self.view.vc = self;
				self.handelMounted();
			}
		});
	},
	unmountView : function(options) {
		if(this.view&&this.mounted){
			console.log("VCELE UNMOUNT:1 fire view's unload @" + this.view.modUri);
			console.log(this.view);
			
			console.log("VCELE UNMOUNT:2 inner dom unload @" + this.view.modUri);			
			console.log("VCELE UNMOUNT:3 unbind event delegation on vcelement @" + this.id);
			options=options||{};
			this.destroySubFrames();
			this.view.beforeDestroy();
			this.view.trigger("unload",true);
			this.view.trigger("beforeRebuild",true);
			this.view.destroy();
			this.view.afterDestroy();
			console.log("VCELE UNMOUNT:4 chge vcelement.mounted to false @" + this.id);
			document.getElementById(this.view.vcid).innerHTML = options.unmountPlaceholder||"";
			delete options.unmountPlaceholder;
			this.mounted = false;
			this.view = null;
		}
		//引用移除
	},
	destroySubFrames:function(){
		var queue = [], vom = this.getVOMObject();
        var root = vom.getElementById(this.id);

        function rc(e) {
            queue.push(e);
            for(var i = 0; i < e.childNodes.length; i++) {
                rc(e.childNodes[i]);
            }
        }

        rc(root);
        console.log("VIEW DESTORY:2.depth traversal all vcelements @" + this.view.modUri);
		
		for(var i = queue.length - 1; i > 0; i--) {
            queue[i].removeNode();
        }
	},
	removeNode : function() {
		console.log("VCELE DESTORY:1 unmount current view @" + this.id);
		if(this.mounted) {
			this.unmountView();
		}
		this.trigger("unload");
		console.log("VCELE DESTORY:2 remove mxvc dom element @" + this.id);
		var node = document.getElementById(this.id);
		if(node) {
			node.parentNode.removeChild(node);
			if(this.linkid) {
				node = document.getElementById(this.linkid);
				node.parentNode.removeChild(node);
			}
			node = null;
		}
		console.log("VCELE DESTORY:3 remove self(vcelement) from vom @" + this.id);
		this.parentNode._removeChild(this);
	},
	_removeChild : function(child) {
		var i, n, newChildNodes = [];
		for( i = 0; i < this.childNodes.length; i++) {
			n = this.childNodes[i];
			if(n == child) {
				this._popFromVOM(n);
			} else {
				newChildNodes.push(n);
			}
		}
		this.childNodes = newChildNodes;
	},
	_popFromVOM : function(n) {
		var vom=this.getVOMObject();
		vom.pop(n);
		n.exist=false;
	},
	postMessage:function(data,from){
		var me=this;
		if(me.exist){
			if(!data)data={};
			data.from=from;
			if(me.__viewLoaded){
				me.view._receiveMessage(data);
			}else{
				me.unbind('viewLoaded');
				me.bind('viewLoaded',function(){
					me.view._receiveMessage(data);
				});
			}
		}
	}
});
