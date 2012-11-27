/**
 * @fileOverview 多播事件对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add("magix/event",function(S,Magix){
	/**
 * 根据名称生成事件数组的key
 * @param  {Strig} name 事件名称
 * @return {String} 包装后的key
 */
var genKey=function(name){
	return '~~'+name+'_list';
};

var safeExec=Magix.safeExec;
/**
 * 多播事件对象
 * @name Event
 * @namespace
 */
var Event={
	/**
	 * @lends Event
	 */
	/**
	 * 触发事件
	 * @param {String} name 事件名称
	 * @param {Object} data 事件对象
	 * @param {Boolean} remove 事件触发完成后是否移除这个事件的所有监听
	 * @param {Boolean} lastToFirst 是否从后向前触发事件的监听列表
	 */
	trigger:function(name,data,remove,lastToFirst){
		var key=genKey(name),
			me=this,
			list=me[key];
		if(list){
			if(!data)data={};
			if(!data.type)data.type=name;
			if(lastToFirst){
				for(var i=list.length-1;i>=0;i--){
					if(safeExec(list[i],data,me)===false){
						break;
					}
				}
			}else{
				for(var i=0,j=list.length;i<j;i++){
					if(safeExec(list[i],data,me)===false){
						break;
					}
				}
			}
		}
		if(remove){
			delete me[key];
		}
	},
	/**
	 * 绑定事件
	 * @param  {String}   name 事件名称
	 * @param  {Function} fn   事件回调
	 */
	bind:function(name,fn){
		var key=genKey(name);
		if(!this[key])this[key]=[];
		this[key].push(fn);
	},
	/**
	 * 解除事件绑定
	 * @param  {String}   name 事件名称
	 * @param  {Function} fn   事件回调
	 */
	unbind:function(name,fn){
		var key=genKey(name),
			list=this[key];
		if(list){
			if(fn){
				for(var i=0,j=list.length;i<j;i++){
					if(list[i]==fn){
						list.splice(i,1);
						break;
					}
				}
			}else{
				delete this[key];
			}
		}
	}
};
	return Event;
},{
	requires:["magix/magix"]
});