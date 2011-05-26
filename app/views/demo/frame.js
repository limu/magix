define(function(require, exports, module){
    var Backbone = require("backbone");
    var Mustache = require("mustache");
    var MxView = require("libs/magix/view");
    var vom = require("libs/magix/vom");
    var _ = require("underscore");
    var View = MxView.extend({
        init: function(o){
            //rendered事件在渲染了主模板后触发,内置rendered响应,此时会遍历住模板中的<mxvc>,并且mxvc如果有viewname直接mount.
            this.bind("rendered", this.mountMainView);
        },
		render: function(){
			//这个是主渲染流程,要根据实际情况来写,比如,列表要连同子模板渲染?
			//渲染一般会需要取回异步数据再进行,所以这里可能启动异步操作.
			//当前view认为render是同步的,在基类里render()之后调用了self.trigger("rendered");
			//应该将trigger拿出来,在子类里负责触发事件,这个改造稍后来做.
            var node = document.getElementById(this.vcid);
            node.innerHTML = Mustache.to_html(this.template, this.queryModel.toJSON());
            this.rendered = true;
        },
        mountMainView: function(){
            //rendered后,根据条件,mount子view.这里pathname和子view简单对应了,可以根据实际情况写这个方法.
            vom.root.childNodes[0].mountView("app/views" + this.queryModel.get("pathname"), {
                queryModel: this.queryModel
            });
        },        
		//queryModelChange实例一则
        queryModelChange: function(model){
            if (model.hasChanged("pathname")) {
				//当发现pathname改变,需要重新mount子View.
                this.mountMainView();
				//同时return false表面不要将change继续传递给子view了.
                return false;
            }
            else {
				//pathname没有改变时,return true 也可以干脆没有return.这样change传递给子View.
				//card子View有针对子View内queryModelChange的实例
                return true;
            }
        }
    });
    return View;
});
