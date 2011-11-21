/**
 * VOM(View Object Model)  管理vcelement
 * @module vom
 * @requires underscore,backbone,magix/vcelement
 */
/**
 * @class Vom
 * @namespace libs.magix
 * @static
 */
define("magix/vom", ["underscore", "backbone", "magix/vcelement"], function(require) {
	var _ = require("underscore");
	var Backbone = require("backbone");
	var MxVCElement = require("magix/vcelement");
	var vom = _.extend(Backbone.Events, {
		/**
		 * _idMap 所有vcelment的索引<br/>
		 * @property _idMap
		 * @type Object
		 */
		_idMap : {},
		/**
		 * root vcelement对象,最外层view容器元素<br/>
		 * @property root
		 * @type Vcelement
		 */
		root : null,
		/**
		 * vom初始化,创建vom.root,插入到dom中.<br/>
		 * @method init
		 * @param {Object} queryString
		 */
		init : function() {
			var node = null;
			if(document.body.id == "vc-root"){
				node = document.body;
			}
			var vc = vom.createElement(node, "vc-root");
			if(!node){
				document.body.insertBefore(vc.getOnce(), document.body.firstChild);
			}			
			vom.root = vc;
			return vom;
		},
		/**
		 * 将Vcelement加入_idMap索引
		 * @method push
		 * @param {Vcelement} vc
		 */
		push : function(vc) {
			vom._idMap[vc.id] = vc;
		},
		/**
		 * 将Vcelement移出_idMap索引
		 * @method pop
		 * @param {Vcelement} vc
		 */
		pop : function(vc) {
			delete vom._idMap[vc.id];
		},
		/**
		 * 创建一个view容器(Vcelement)
		 * @method pop
		 * @param {element|string} ele
		 * @param {string} vc id
		 * @return Vcelement
		 */
		createElement : function(ele, id) {
			if(_.isString(ele)) {
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
		getElementById : function(id) {
			return this._idMap[id] || null;
		}
	});
	window.MXVom = vom;
	//TODO del
	return vom.init();
});
