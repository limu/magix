/**
 * Controller负责按照规则将hash值Route至指定的View.
 * @module controller
 * @requires backbone,undersocre,app/config/ini
 */
/**
 * Controller负责按照规则将hash值Route至指定的View.
 * @class Controller
 * @namespace libs.magix
 * @static
 */
define("magix/controller",["libs/backbone","libs/underscore","app/config/ini"],function(require, exports, module) {
	var Backbone = require("libs/backbone");
	var _ = require("libs/underscore");
	var config = require("app/config/ini");

	var MxController = function() {
		this.initialize();
	};

	_.extend(MxController.prototype, Backbone.Event, {
		initialize : function(o) {
			var p2v = config.pathViewMap, viewName;
			for(var k in p2v) {
				if(!p2v[k]) {
					p2v[k] = config.defaultViewName;
				}
			}
			/**
			 * 存储全局共享信息,<br/>
			 * 如require("libs/magix/controller").env.templates存储模板
			 * @property env
			 * @type Object
			 */
			this.env = {
				appHome : config.uri.split("app/config/")[0],
				templates : {}
			};
			return this;
		},
		_route : function(query) {
			this.referrer = this.query || null;
			this.query = query;
			this.pathName = config.indexPath;
			this.paraObj = {};
			this._fixPathPara(query);
			this.oldViewName = this.viewName;
			this.viewName = this._getViewName();
			this._mountView();
			this.postData = null;
		},
		setPostData : function(o) {
			this.postData = o;
		},
		/**
		 * 将传入的queryString Merge到当前的hashQuery中,生成新的query.<br/>
		 * 原hash: #!/a/b/x=1&y=2&offset=20<br/>
		 * reqiure("libs/magix/controller").navigateTo("z=1&offset=0");<br/>
		 * 新hash: #!/a/b/x=1&y=2&z=3&offset=0<br/>
		 * @method navigateTo
		 * @param {Object} queryString
		 */
		navigateTo : function(q) {
			var np = this.unParam(q);
			var v1 = _.clone(this.paraObj);
			delete v1.referrer;
			delete v1.pathname;
			delete v1.query;
			delete v1.postdata;
			var v2 = _.extend(v1, np);
			var nps = this.param(v2);
			//var nps = this.param(_.extend(_.clone(this.paraObj),np));
			this._goto(this.pathName + "/" + nps);
		},
		_goto : function(url) {
			location.hash = "!" + url;
		},
		/**
		 * 查询对象,包含query,pathname,referrer,postData和hash包含的众多参数<br/>
		 * 这是一个Backbone.Model对象实例,可以通过监听该对象的change事件,监视url的变化.<br/>
		 * hash解析规则,"#!/a/b/x=1&y=2&z=3" 等同于 "#/a/b/x=1&y=2&z=3",将被解析为:<br/>
		 * {<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;referrer:null,<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;postdata:null,<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;pathname:"/a/b",<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;query:"/a/b/x=1&y=2&z=3",<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;x:"1",<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;y:"2",<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;z:"3"<br/>
		 * }
		 * @property queryModel
		 * @type Backbone.Model
		 */
		_mountView : function() {
			var self = this;
			var queryObject = this._getQueryObject();
			if(this.viewName == this.oldViewName) {
				this._fixQueryObject(queryObject);
				this.queryModel.set(queryObject);
			} else {
				require.async("./vom", function(vom) {
					self.queryModel = new Backbone.Model(queryObject);
					vom.root.mountView(self.viewName, {
						queryModel : self.queryModel
					});
				});
			}
		},
		_fixQueryObject : function(queryObject) {
			if(this.queryModel) {
				var k, old = this.queryModel.toJSON();
				for(k in old) {
					if(!( k in queryObject)) {
						this.queryModel.unset(k, {
							silent : true
						});
					}
				}
			}
		},
		_getQueryObject : function() {
			var queryObject = _.extend(this.paraObj, {
				referrer : this.referrer,
				query : this.query,
				pathname : this.pathName,
				postdata : this.postData || null
			});
			return queryObject;
		},
		_getViewName : function() {
			var p2v = config.pathViewMap, viewName;
			if(p2v[this.pathName]) {
				viewName = p2v[this.pathName];
			} else {
				viewName = p2v[config.notFoundPath];
			}
			if(this.paraObj.__view__) {
				viewName = this.paraObj.__view__.split("-").join("/");
			}
			return viewName;
		},
		_fixPathPara : function(query) {
			var tmpArr, paraStr, kv;
			if(query) {
				tmpArr = query.split("/");
				paraStr = tmpArr.pop();
				this.pathName = tmpArr.join("/");
				this.paraObj = this.unParam(paraStr);
			}
		},
		/**
		 * 将传入的queryObject转化为key1=value1&key2=value2的queryString
		 * @method param
		 * @param {Object} queryObject
		 * @return {String}
		 */
		param : function(o) {
			var res = [];
			for(var k in o) {
				if(o.hasOwnProperty(k)) {
					res.push(k + "=" + o[k]);
				}
			}
			return res.join("&");
		},
		/**
		 * 与param方法的相反,将传入的queryString转化为Object
		 * @method unParam
		 * @param {String} queryString
		 * @return {Object}
		 */
		unParam : function(s) {
			var paraArr = s.split("&");
			var kv, res = {};
			for(var i = 0; i < paraArr.length; i++) {
				kv = paraArr[i].split("=");
				if(kv[0]) {
					res[kv[0]] = kv[1] || "";
				}
			}
			return res;
		}
	});
	if(!MxController.inst) {
		MxController.inst = new MxController();
	}
	window.MXController = MxController.inst;
	return MxController.inst;
});
/**
 * VOM(View Object Model)  管理vcelement
 * @module vom
 * @requires underscore,backbone,libs/magix/vcelement
 */
/**
 * @class Vom
 * @namespace libs.magix
 * @static
 */
define("magix/vom",["libs/underscore","libs/magix/vcelement","libs/backbone"],function(require){
    var _ = require("libs/underscore");
    var MxVCElement = require("libs/magix/vcelement");
    var Backbone = require("libs/backbone");
    var vom = _.extend(Backbone.Events, {
        /**
         * _idMap 所有vcelment的索引<br/>
         * @property _idMap
         * @type Object
         */
        _idMap: {},
        /**
         * root vcelement对象,最外层view容器元素<br/>
         * @property root
         * @type Vcelement
         */
        root: null,
        /**
         * vom初始化,创建vom.root,插入到dom中.<br/>
         * @method init
         * @param {Object} queryString
         */
        init: function(){
            var vc = vom.createElement(null, "vc-root");
            document.body.insertBefore(vc.getOnce(), document.body.firstChild);
            vom.root = vc;
            return vom;
        },
		/**
		 * 将Vcelement加入_idMap索引
		 * @method push
		 * @param {Vcelement} vc
		 */
        push: function(vc){
            vom._idMap[vc.id] = vc;
        },
		/**
		 * 将Vcelement移出_idMap索引
		 * @method pop
		 * @param {Vcelement} vc
		 */
        pop: function(vc){
            delete vom._idMap[vc.id];
        },
		/**
		 * 创建一个view容器(Vcelement)
		 * @method pop
		 * @param {element|string} ele 
		 * @param {string} vc id
		 * @return Vcelement
		 */
        createElement: function(ele, id){
            if (_.isString(ele)) {
                ele = document.getElementById(ele);
            }
            var vc = new MxVCElement(ele, id);
            vom.push(vc);
            return vc;
        },
		/**
		 * 根据id获取vcelement对象
		 * @method getElementById
		 * @param {string} vc id
		 * @return Vcelement
		 */
        getElementById: function(id){
            return this._idMap[id] || null;
        }
    });
    window.MXVom = vom;//TODO del
    return vom.init();
});
/**
 * Magix ViewContainer节点元素
 * @module vcelement
 * @requires underscore,backbone,libs/magix/controller
 * @require.asynces libs/magix/vom
 */
/**
 * ViewContainer节点元素,对应一个HTMLElement,可以通过mount,unMount将Magix View渲染至这个节点内.
 * @class Vcelement
 * @namespace libs.magix
 * @constructor
 * @param {HTMLElement} node (可选)View根节点
 * @param {String} id (可选)View根节点id
 */
define("magix/vcelement",["libs/underscore","libs/backbone","libs/magix/controller"],function(require, exports, module) {
	var VCTAG = "mxvc";
	//hack for custom tag for ie
	var mxview = document.createElement(VCTAG);
	mxview = null;
	var _ = require("libs/underscore");
	var Backbone = require("libs/backbone");
	var VCElement = function(node, id) {
		this._node = node || document.createElement(VCTAG);
		this.id = this.idIt(this._node, id);
		this.childNodes = [];
		this.mounted = false;
		this.mounting = false;
		this.isLink = false;
		this.parentNode = null;
		if(node) {
			this.freeNode();
		}
	};
	_.extend(VCElement.prototype, Backbone.Events, {
		/**
		 * 容器中的view<br/>
		 * @property view
		 * @type Object
		 */
		view : null,
		/**
		 * 为dom元素增加唯一id<br/>
		 * @method idIt
		 * @param {Element} 节点
		 * @param {id} id
		 */
		idIt : function(node, id) {
			var tid, vn, tnode;
			if(node && node.getAttribute("link_to")) {
				tid = node.getAttribute("link_to");
				tnode = document.getElementById(tid);
				vn = node.getAttribute("view_name");
				if(tnode && vn) {
					tnode.setAttribute("view_name", vn);
				}
				node.id = node.id || VCElement.uniqueId();
				this.isLink = true;
				this.linkid = node.id;
				return tid;
			}
			node.id = (node && node.id) || id || VCElement.uniqueId();
			return node.id;
		},
		/**
		 * 从vcelement中得到vc对应元素节点,并将节点释放<br/>
		 * @method getOnce
		 * @return {Element} 返回节点
		 */
		getOnce : function() {
			var node = this._node;
			if(!node) {
				console.warn("always get once");
			}
			this.freeNode();
			return node;
		},
		/**
		 * 释放vcelement中的节点引用<br/>
		 * @method freeNode
		 */
		freeNode : function() {
			this._node = null;
		},
		/**
		 * 装载view<br/>
		 * @method mountView
		 * @param {String} viewName view名称
		 * @param {Object} options view配置信息
		 * @return {Element} 返回节点
		 */
		mountView : function(viewName, options) {
			options = options || {
				queryModel : require("libs/magix/controller").queryModel
			};
			if(!viewName) {
				return;
			}
			var self = this;
			this.mounting = true;
			if(this.view) {
				this.view.destory();
				this.view = null;
			}
			require.async(viewName, function(View) {
				options.vcid = self.id;
				options.el = self.id;
				options.id = self.id;
				options.viewName = viewName;
				self.view = new View(options);
				if(options.message && typeof options.message == 'function') {
					self.view.bind("message", options.message);
				}
				if(self.view.rendered) {
					self.mounting = false;
					self.mounted = true;
					self.trigger("mounted", self.view);
				} else {
					self.view.bind("rendered", function() {
						self.mounting = false;
						self.mounted = true;
						self.trigger("mounted", self.view);
					});
				}
				if(!window.MXRootView) {//TODO delete
					window.MXRootView = self.view;
				}
			});
		},
		/**
		 * 获取mxvc元素上的属性值<br/>
		 * @method getAttribute
		 * @param {String} s 属性名称
		 * @return {String} 属性值
		 */
		getAttribute : function(s) {
			var node = document.getElementById(this.id);
			return node.getAttribute(s) || "";
		},
		/**
		 * 设置mxvc元素上的属性值<br/>
		 * @method getAttribute
		 * @param {String} k 属性名称
		 * @param {String} v 属性名称
		 */
		setAttribute : function(k, v) {
			var node = document.getElementById(this.id);
			return node.setAttribute(k, v);
		},
		/**
		 * 获取当前mxvc下所有子mxvc节点集合<br/>
		 * @method getElements
		 * @return {Array}
		 */
		getElements : function() {
			var node = document.getElementById(this.id);
			var nodes = node.getElementsByTagName(VCTAG);
			var i, res = [];
			for( i = 0; i < nodes.length; i++) {
				res.push(this.idIt(nodes[i]));
			}
			return res;
		},
		/**
		 * 将传入vcelement,追加到本vcelement的childNodes中<br/>
		 * @method appendChild
		 * @param {Vcelement}
		 */
		appendChild : function(c) {
			//this.childNodes = this.childNodes ||[];
			this.childNodes.push(c);
			c.parentNode = this;
		},
		/**
		 * 销毁自身vcelement,首先卸载view,然后从dom中移出自身节点,从vom中移出自身并销毁<br/>
		 * @method removeNode
		 */
		removeNode : function() {
			console.log("VCELE DESTORY:1 unmount current view @" + this.id);
			if(this.mounted) {
				this.unmountView();
			}

			console.log("VCELE DESTORY:2 remove mxvc dom element @" + this.id);
			var node = document.getElementById(this.id);
			node.parentNode.removeChild(node);
			if(this.linkid) {
				node = document.getElementById(this.linkid);
				node.parentNode.removeChild(node);
			}
			node = null;
			console.log("VCELE DESTORY:3 remove self(vcelement) from vom @" + this.id);
			this.parentNode.removeChild(this);
		},
		/**
		 * 销毁某个子Vcelment<br/>
		 * @method removeChild
		 */
		removeChild : function(child) {
			//TODO strengthen removeChild for single call(not by removeNode);
			//			if(child.mounted){
			//				child.unmountView();
			//			}
			var i, n, newChildNodes = [];
			for( i = 0; i < this.childNodes.length; i++) {
				n = this.childNodes[i];
				if(n == child) {
					require.async("./vom", function(vom) {
						vom.pop(n);
					});
				} else {
					newChildNodes.push(n);
				}
			}
			this.childNodes = newChildNodes;
		},
		/**
		 * 从Vclement中卸载view,出发vclement.unload事件,清除内部节点,注销vc上的事件,改变mounted状态<br/>
		 * @method unmountView
		 */
		unmountView : function() {
			console.log("VCELE UNMOUNT:1 fire view's unload @" + this.view.modUri);
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

		}
	});
	_.extend(VCElement, {
		uniqueId : function() {
			return _.uniqueId("vc-");
		}
	});
	return VCElement;
});
/**
 * Magix View 模块
 * @module view
 * @requires backbone,underscore,libs/magix/vom,libs.magix/controller,libs/magix/helper,libs/magix/mu
 */
/**
 * Magix View基类.继承自Backbone.View.用于管理View声明周期,事件代理,渲染数据,以及响应Hash变化.<br/>
 * MagixView子类位于app/views目录之下,通过重写init,render,queryModelChange,renderer,events来扩展出具体子类,如:<br/>
 * define(function(){<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;require("libs/magix/view").extend({init:...,render:...});<br/>
 * }<br/>
 * 通常不会直接通过new View(config)来创建类的实例,而是通过vcElement.mountView("viewName")的方式将view装载入一个容器(<a href="module_vcelement.html">vcelement</a>)时进行实例化.
 * @class View
 * @param {Object} config config其中必须包含viewName,vcid和queryModel三项,指明view的名字,展示view的容器id和当前的query
 * @constructor
 */
define("magix/view",["libs/backbone","libs/magix/vom","libs/underscore","libs/magix/controller","libs/magix/helper","libs/magix/mu"],function(require, exports, module) {
	var Backbone = require("libs/backbone");
	var vom = require("libs/magix/vom");
	var _ = require("libs/underscore");
	var ctrl = require("libs/magix/controller");
	var helper = require("libs/magix/helper");
	var Mustache = require("libs/magix/mu");
	var MxView = Backbone.View.extend({
		/**
		 * 实例化过程会调用init方法,在这个方法中可以完成一些初始化任务,比如载入将要使用的Model/Collection对象
		 * @method init
		 */
		initialize : function(o) {
			var self = this;
			this.subViewsChange = [];
			this.options = o;
			this.vcid = o.vcid;
			this.queryModel = o.queryModel;
			this.viewName = o.viewName;
			/***********左莫增加标识符，用来判断当前view是否在vom节点中begin*************/
			this.exist = true;
			//监听unload事件
			this.bind("unload", function() {
				this.exist = false;
			});
			/***********左莫增加标识符，用来判断当前view是否在vom节点中end*************/

			this.bind("rendered", function() {
				this.trigger("beforeSubviewsRender");
				var vc = vom.getElementById(this.vcid);
				var childVcs = vc.getElements();
				var i, child;
				for( i = 0; i < childVcs.length; i++) {
					child = vom.createElement(childVcs[i]);
					vc.appendChild(child);
					child.mountView(child.getAttribute("view_name"), {
						queryModel : this.queryModel
					});
				}
			});
			var vc = vom.getElementById(this.vcid);
			if(vc == vom.root) {
				this.queryModel.bind("change", function() {
					console.log("QM CHANG: Root View Query change " + self.viewName);
					var res = self.queryModelChange(this);
					self._changeChain(res, this);
				});
			}
			if(this.init) {
				this.init();
			}
			this.getTemplate(function(data) {
				self.template = data;
				var autoRendered = self.render();
				if(autoRendered !== false) {
					self.trigger("rendered");
				}
			});
		},
		_queryModelChange : function(model) {
			console.log("QM CHANG: Sub View Query change" + this.viewName);
			var res = this.queryModelChange(model);
			this._changeChain(res, model);
		},
		_changeChain : function(res, model) {
			var vcs = [], i;
			var vc = vom.getElementById(this.vcid);
			if(res === false) {
				return;
			}
			if(res === true || res === undefined) {
				vcs = vc.childNodes;
			} else if(_.isArray(res)) {
				vcs = res;
			}
			for( i = 0; i < vcs.length; i++) {
				if(vcs[i].view) {
					vcs[i].view._queryModelChange(model);
				}
			}
		},
		/**
		 * query发生变化事件响应函数,基类中是个空方法,各子类在需要时实现这个方法<br/>
		 * 注意,并非query发生变化一定会触发这个方法,需要由父View决定是否将change事件下发给子View.<br/>
		 * 相应的return true将会下发change事件给子view,false反之,return vcid数组,将事件传递给指定的子View.
		 * @method queryModelChange
		 * @return {Boolean|Array}
		 */
		queryModelChange : function() {

		},
		/**
		 * view渲染方法,各子类可以覆盖<br/>
		 * 默认会将query交给同名的模板文件,渲染至vcelement内.
		 * @method render
		 */
		render : function() {
			var node = document.getElementById(this.vcid);
			node.innerHTML = Mustache.to_html(this.template, this.queryModel.toJSON());
			this.rendered = true;
		},
		refresh : function() {

		},
		getTemplate : function(cb, name) {
			var url = ctrl.env.appHome + this.viewName;
			if(name) {
				url = url + "." + "name" + ".html";
			} else {
				url = url + ".html";
			}
			helper.getTemplate(url, function(data) {
				cb(data);
			});
		},
		destory : function() {
			var vcQueue, i;
			console.log("VIEW DESTORY:1.begin unmount view @" + this.modUri);
			vcQueue = this.getDestoryQueue();
			console.log("VIEW DESTORY:3.destory vcelement from the end of the queue util this vcelement total " + (vcQueue.length - 1) + " vcelements @" + this.modUri);
			for( i = vcQueue.length - 1; i > 0; i--) {
				vcQueue[i].removeNode();
			}
			console.log("VIEW DESTORY:4.unmount reference vcelement @" + this.modUri);
			var root = vom.getElementById(this.vcid);
			root.unmountView();
			console.log("VIEW DESTORY:5.destory view complete OK!! @" + this.modUri);
		},
		getDestoryQueue : function() {
			var queue = [];
			var root = vom.getElementById(this.vcid);

			function rc(e) {
				var i;
				queue.push(e);
				for( i = 0; i < e.childNodes.length; i++) {
					rc(e.childNodes[i]);
				}
			}

			rc(root);
			console.log("VIEW DESTORY:2.depth traversal all vcelements @" + this.modUri);
			return queue;
		},
		/**
		 * 设置数据到this.data,内部会自动把renderer附加到data中<br/>
		 * mustahce.tohtml(template,this.setData({list:...}));
		 * @method setData
		 */
		setData : function(data) {
			this.data = data;
			for(var k in data) {
				if(data[k].toJSON) {
					data[k] = data[k].toJSON();
				}
			}
			data.query = this.queryModel.toJSON();
			this.setRenderer();
		},
		/**
		 * 为复杂数据渲染构建renderer<br/>
		 * TODO:细化方法使用
		 * @property renderer
		 */
		setRenderer : function() {
			var self = this, rr = this.renderer, mcName, wrapperName;
			if(rr) {
				for(mcName in rr) {
					for(wrapperName in rr[mcName]) {(function() {
							var mn = mcName, wn = wrapperName;
							var fn = rr[mn][wn];
							self.data[mn + "_" + wn] = function() {
								return fn.call(this, self, mn);
							};
						})();
					}
				}
			}
		},
		/**
		 * 所有事件处理函数
		 * TODO:细化方法使用
		 * @property events
		 */
		delegateEvents : function() {
			var events = this.events;
			var node = document.getElementById(this.el);
			for(var _type in events) {(function() {
					var type = _type;
					node["on" + type] = function() {
						var event = arguments[0] || window.event;
						var target = event.target || event.srcElement;
						var root = this;
						if(target.nodeType != 1) {
							target = target.parentNode;
						}
						var eventinfo = target.getAttribute("mx" + type);
						if(eventinfo) {
							var events = eventinfo.split("|"), eventArr, eventKey;
							var vc = vom.getElementById(root.id);
							var view = vc.view;
							for(var i = 0; i < events.length; i++) {
								eventArr = events[i].split(":");
								eventKey = eventArr.shift();

								// 事件代理,通过最后一个参数,决定是否阻止事件冒泡和取消默认动作
								var evtBehavior = eventArr[eventArr.length - 1], evtArg = false;
								if(evtBehavior == '_halt_' || evtBehavior == '_preventDefault_') {
									event.preventDefault ? event.preventDefault() : (event.returnValue = false);
									evtArg = true;
								}
								if(evtBehavior == '_halt_' || evtBehavior == '_stop_') {
									event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
									evtArg = true;
								}
								if(evtArg) {
									eventArr.pop();
								}
								if(view.events && view.events[type] && view.events[type][eventKey]) {
									view.events[type][eventKey](view, view.idIt(target), eventArr);
								}
							}
						}
						target = null;
						root = null;
					};
				})();
			}
		},
		idIt : function(node) {
			var id = "";
			if(!node.id) {
				node.id = _.uniqueId("mxevt-");
			}
			id = node.id;
			node = null;
			return id;
		}
	});
	return MxView;
});
/**
 * 通用方法
 * @module helper
 * @requires jquery,libs/magix/controller
 */
/**
 * 通用方法静态类
 * @class Helper
 * @namespace libs.magix
 * @static
 */
define("magix/helper",["libs/jquery","libs/magix/controller"],function(require){
    var $ = require("libs/jquery");
    var templates = require("libs/magix/controller").env.templates;
    var helper = {};
    helper.ajax = $.ajax;
    /**
     * 获取模板后回调
     * @method getTemplate
     * @param {String} uri 模板地址
     * @param {Function} cb 获取模板后回调,回调函数将接收到一个参数为模板字符串
     */
    helper.getTemplate = function(uri, cb){
        var t = (new Date()).getTime();
        if (templates[uri]) {
            cb(templates[uri]);
        }
        else {
            console.log("get template:" + uri);
            helper.ajax(uri + "?__t=" + t, {
                dataType: "text",
                success: function(data){
                    templates[uri] = data;
                    cb(data);
                }
            });
        }
    };
    return helper;
});
/**
 * Magix扩展的Mustache
 * @module mu
 * @require mustache
 */
/**
 * 扩展的Mustache类<br/>
 * 支持简单的条件判断 如:
<pre>
{{#list}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==P)}}ID:{{id}},status:&lt;b style='color:green'>通过&lt;/b>{{/if(status==P)}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==W)}}ID:{{id}},status:等待{{/if(status==W)}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==R)}}ID:{{id}},status&lt;b style='color:red'>拒绝&lt;/b>{{/if(status==R)}}
{{/list}}
</pre>
 * 对于数组对象可以通过{{__index__}}访问数组下标
 * @class Mu
 * @namespace libs.magix
 * @static
 */
define("magix/mu",["libs/mustache"],function(require){
    var Mustache = require("libs/mustache");
    function addFns(template, data){
        var ifs = getConditions(template);
        var key = "";
        for (var i = 0; i < ifs.length; i++) {
            key = "if(" + ifs[i] + ")";
            if (data[key]) {
                continue;
            }
            else {
                data[key] = buildFn(ifs[i]);
            }
        }
    }
    function getConditions(template){
        var ifregexp_ig = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/ig;
        var ifregexp_i = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/i;
        var gx = template.match(ifregexp_ig);
        var ret = [];
        if (gx) {
            for (var i = 0; i < gx.length; i++) {
                ret.push(gx[i].match(ifregexp_i)[1]);
            }
        }
        return ret;
    }
    function buildFn(key){
        key = key.split("==");
        var res = function(){
            var ns = key[0].split("."), value = key[1];
            var curData = this;
            for (var i = ns.length - 1; i > -1; i--) {
                var cns = ns.slice(i);
                var d = curData;
                try {
                    for (var j = 0; j < cns.length - 1; j++) {
                        d = d[cns[j]];
                    }
                    if (cns[cns.length - 1] in d) {
                        if (d[cns[cns.length - 1]].toString() === value) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                } 
                catch (err) {
                }
            }
            return false;
        };
        return res;
    }
    function findArray(o, depth){
        var k, v;
        for (k in o) {
            v = o[k];
            if (v instanceof Array) {
                addArrayIndex(v);
            }
            else 
                if (typeof(v) == "object" && depth < 5) {
                    findArray(v, depth + 1);
                }
        }
    }
    function addArrayIndex(v){
        for (var i = 0; i < v.length; i++) {
            o = v[i];
            if (typeof(o) == "object") {
                if (i === 0) {
                    o.__first__ = true;
                }
                else 
                    if (i == (v.length - 1)) {
                        o.__last__ = true;
                    }
                    else {
                        o.__mid__ = true;
                    }
                o.__index__ = i;
            }
        }
    }
    return {
        /**
         * 输出模板和数据,返回渲染后结果字符串,接口与Mustache完全一致
         * @method to_html
         * @param {String} template 模板字符串
         * @param {Object} data 数据Object
         * @return {String}
         */
        to_html: function(template, data){
            if (typeof(data) == "object") {
                findArray(data, 0);
            }
            addFns(template, data);
            return Mustache.to_html.apply(this, arguments);
        }
    };
});


