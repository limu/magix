//vframe
KISSY.add("magix/vframe",function(S,impl,Base){
	var Vframe;
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
	getRouterObject:Base.unimpl,
	/*
	 * 无法放到Vframe中，因为Vframe的tagName未实现，也不会实现，
	 * 原来的实现方案是把tagName覆盖掉，这是不正确的
	 * 模板方法类中的方法应该一直保持原样，实现类中也应该保持原样
	 * 谁也不应该被改写
	 */
	createFrame:Base.unimpl,
	getVOMObject:Base.unimpl,
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
		
		
		this.unmountView();//先清view
		/*if(this.view) {
			this.view.destroy();
		}*/
		//
		var self = this,router=this.getRouterObject();
		options = options || {};
		if(!options.queryModel){//确保每个view都有queryModel，请参考View的initial方法
			options.queryModel=router.queryModel;
		}
		//
		Base.requireAsync(viewName, function(View) {
			
			options.vcid = self.id;
			options.viewName = viewName;
			//options.el = self.id;
			//options.id = self.id;
			self.view = new View(options);
			//self.view.vc = self;
			self.handelMounted();
		});
	},
	unmountView : function() {
		if(this.view&&this.mounted){
			
			
			
						
			
			this.destroySubFrames();
			this.view.trigger("unload");
			this.view.destroy();
			
			document.getElementById(this.view.vcid).innerHTML = "";
			this.mounted = false;
			this.view = null;
		}
		//引用移除
	},
	destroySubFrames:function(){
		var queue = [], vom = this.getVOMObject();
        var root = vom.getElementById(this.view.vcid);

        function rc(e) {
            queue.push(e);
            for(var i = 0; i < e.childNodes.length; i++) {
                rc(e.childNodes[i]);
            }
        }

        rc(root);
        
		
		for(var i = queue.length - 1; i > 0; i--) {
            queue[i].removeNode();
        }
	},
	removeNode : function() {
		
		if(this.mounted) {
			this.unmountView();
		}
		this.trigger("unload");
		
		var node = document.getElementById(this.id);
		if(node) {
			node.parentNode.removeChild(node);
			if(this.linkid) {
				node = document.getElementById(this.linkid);
				node.parentNode.removeChild(node);
			}
			node = null;
		}
		
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
		Base.requireAsync("magix/vom", function(VOM) {
			VOM.pop(n);
		});
	}
});

	var iVframe = Base.implement(Vframe,impl);
	return iVframe.init();
},{
	requires:["magix/impls/vframe","magix/base"]
});