/**
 * Magix QueryModel 将URLhash部分信息解析为一个对象,并存放在Backbone.Model实例中.
 * @module	magix/query_model
 * @author limu@taobao.com
 * @reqiure "backbone"
 */

/**
 * MxQuery queryModel构造器,
 * @class MxQuery
 * @extend Backbone.Model
 * @param {Object} attributes 包含pathname,query,referrer和所有解析为键值对的url参数
 * @constructor
 */
define(function(require){
	var Backbone = require("backbone");
	var MxQuery = Backbone.Model.extend({
        destory: function(){
            console.log("will leave page:" + this.get("pathname"));
        }
    });
	return MxQuery;
});
