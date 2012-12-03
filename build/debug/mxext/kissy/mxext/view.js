/**
 * @fileOverview 对magix/view的扩展
 * @version 1.0
 * @author 行列
 */
KISSY.add('mxext/view',function(S,View,Router){
	var WIN=window;
	/*
		queryEvents:{
			click:{
				'#id':function(){
					
				},
				'.title':function(){//  S.one('.title').click(); S.one().delegate(); 
					
				}
			},
			mouseover:{
				'#id':function(e){
					
				}
			}
		}
	 */
	/**
	 * @name MxView
	 * @namespace
	 * @requires View
	 * @augments View
	 */
	return View.extend({
		/**
		 * @lends MxView#
		 */
		/**
		 * 根据选择器来注册事件
		 * @type {Object}
		 * @example
		 * queryEvents:{
		 * 		click:{
		 * 			'#name':function(e){
		 * 				
		 * 			},
		 * 			'#name .label':function(e){
		 * 				
		 * 			}
		 * 		}
		 * }
		 */
		queryEvents:null,
		/**
		 * 调用magix/router的navigate方法
		 * @param {Object|String} params 参数字符串或参数对象
		 */
		navigate:function(params){
			Router.navigate(params);
		},
		/**
		 * 根据选择器添加事件
		 */
		attachQueryEvents:function(){
			var me=this;
			var queryEvents=me.queryEvents;
			if(queryEvents){
				me.$queryEventsCache={};
				for(var p in queryEvents){
					var evts=queryEvents[p];
					for(var q in evts){
						
						S.all('#'+me.id+' '+q).on(p,me.$queryEventsCache[p+'_'+q]=(function(fn){
							return function(e){
								var targetId=View.idIt(e.target);
								var currentId=View.idIt(e.currentTarget);
								Magix.safeExec(fn,{
									view:me,
									targetId:targetId,
									currentId:currentId,
									queryEvents:queryEvents,
									domEvent:e
								},queryEvents);
							}
						}(evts[q])));
					}
				}
			}
			
		},
		/**
		 * 清除根据选择器添加的事件
		 */
		detachQueryEvents:function(){
			var me=this;
			var queryEvents=me.queryEvents;
			if(queryEvents){
				for(var p in queryEvents){
					var evts=queryEvents[p];
					for(var q in evts){
						S.all('#'+me.id+' '+q).detach(p,me.$queryEventsCache[p+'_'+q]);
					}
				}
				delete me.$queryEventsCache;
			}
		},
		setData: function(data) {
	        this.data = data;
	        for (var k in data) {
	            if (data[k]&&data[k].toJSON) {
	                data[k] = data[k].toJSON();
	            }
	        }
	        this.setRenderer();
	    },
	    setRenderer: function() {
	        var self = this,
	            rr = this.renderer,
	            mcName, wrapperName;
	        if (rr) {
	            for (mcName in rr) {
	                for (wrapperName in rr[mcName]) {
	                    (function() {
	                        var mn = mcName,
	                            wn = wrapperName;
	                        var fn = rr[mn][wn];
	                        self.data[mn + "_" + wn] = function() {
	                            return fn.call(this, self, mn);
	                        };
	                    })();
	                }
	            }
	        }
	    }
	},function(){
		var me=this;
		
		me.bind('created',function(){
			me.attachQueryEvents();
			me.bind('prerender',function(){
				me.detachQueryEvents();
			});
			me.bind('rendered',function(){
				me.attachQueryEvents();
			});
		});
	});
},{
	requires:["magix/view","magix/router"]
});