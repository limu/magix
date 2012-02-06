KISSY.add("magix/ajax",function(S,impl,Base){
    var Ajax;
    Ajax={
    defaultOptions:{//默认ajax请求参数
        dataType:'html',
        success:function(){},
        failure:function(){}
    },
    /*
     * 发送异步请求
     * 默认支持dataType url success failure 四个参数
     */
    send:Base.unimpl,
    /*
     * 处理请求的参数，方便在send方法中直接使用相应的属性，避免判断
     */
    processOptions:function(ops){
        var me=this;
        if(!ops)ops={};
        for(var p in me.defaultOptions){
            if(!ops[p])ops[p]=me.defaultOptions[p];
        }
        return ops;
    },
    /*
     * 获取模板内容
     */
    getTemplate:function(url,succ,fail){
        var me=this,data;
        if(!me.$cache)me.$cache={};
        data=me.$cache[url];
        if(data){
            if(data.succ&&Base.isFunction(succ)){
                succ(data.content);
            }else if(!data.succ&&Base.isFunction(fail)){
                fail(data.content);
            }
            return;
        }
        me.send({
            url:url,
            dataType:'html',
            success:function(data){
                me.$cache[url]={succ:true,content:data};
                if(Base.isFunction(succ)){
                    succ(data);
                }
            },
            failure:function(msg){
                me.$cache[url]={content:msg};
                if(Base.isFunction(fail)){
                    fail(msg);
                }
            }
        });
    }
};
    return Base.implement(Ajax,impl);
},{
    requires:["magix/impls/ajax","magix/base"]
});