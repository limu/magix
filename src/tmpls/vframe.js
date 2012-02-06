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
	/*
	 * 无法放到Vframe中，因为Vframe的tagName未实现，也不会实现，
	 * 原来的实现方案是把tagName覆盖掉，这是不正确的
	 * 模板方法类中的方法应该一直保持原样，实现类中也应该保持原样
	 * 谁也不应该被改写
	 */
	createFrame:Base.unimpl,
	initial : function(node, id) {
		//
		this.id = "";
		this.parentNode = null;
		this.childNodes = [];
		this.mounted = false;
		//
		this._domNode = node || this.createFrame();
		this.id = this._idIt(this._domNode, id);
		if(node) {
			this._domNode = null;
			node = null;
		}
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
		if(this.view.rendered) {
			this.mounted = true;
			this.trigger("mounted", this.view);
		} else {
			this.view.bind("rendered", function() {
				this.mounted = true;
				this.trigger("mounted", this.view);
			});
		}
	},
	mountView : function(viewName, options) {
		if(!viewName) {
			return;
		}
		console.log(this.view);
		if(this.view) {
			this.view.destroy();
		}
		//
		var self = this;
		options = options || {};
		//
		Base.requireAsync(viewName, function(View) {
			console.log(View,View.toString());
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
		console.log("VCELE UNMOUNT:1 fire view's unload @" + this.view.modUri);
		console.log(this.view);
		this.view.trigger("unload");
		console.log("VCELE UNMOUNT:2 inner dom unload @" + this.view.modUri);
		document.getElementById(this.view.vcid).innerHTML = "";
		console.log("VCELE UNMOUNT:3 unbind event delegation on vcelement @" + this.id);
		if(this.view.events) {
			var node = document.getElementById(this.id);
			for(var eventType in this.view.events) {
				node["on" + eventType] = null;
			}
			node = null;
		}
		console.log("VCELE UNMOUNT:4 chge vcelement.mounted to false @" + this.id);
		this.mounted = false;
		this.view = null;
		//引用移除
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
		Base.requireAsync("magix/vom", function(VOM) {
			VOM.pop(n);
		});
	}
});
