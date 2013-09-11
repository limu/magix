##Magix各版本CDN地址

####1.1
http://a.tbcdn.cn/apps/e/magix/1.1/kissy-magix.js (KISSY类库，Magix核心未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.1/kissy-magix-min.js (KISSY类库，Magix核心压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.1/kissy-magix-mxext.js (KISSY类库，Magix核心与扩展未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.1/kissy-magix-mxext-min.js (KISSY类库，Magix核心与扩展压缩版)<br />

http://a.tbcdn.cn/apps/e/magix/1.1/seajs-magix.js (sejs+jq类库，Magix核心未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.1/seajs-magix-min.js (sejs+jq类库，Magix核心压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.1/seajs-magix-mxext.js (sejs+jq类库，Magix核心与扩展未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.1/seajs-magix-mxext-min.js (sejs+jq类库，Magix核心与扩展压缩版)<br />

http://a.tbcdn.cn/apps/e/magix/1.1/requirejs-magix.js (requirejs+jq类库，Magix核心未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.1/requirejs-magix-min.js (requirejs+jq类库，Magix核心压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.1/requirejs-magix-mxext.js (requirejs+jq类库，Magix核心与扩展未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.1/requirejs-magix-mxext-min.js (requirejs+jq类库，Magix核心与扩展压缩版)<br />


####1.0
http://a.tbcdn.cn/apps/e/magix/1.0/kissy-magix.js (KISSY类库，Magix核心未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.0/kissy-magix-min.js (KISSY类库，Magix核心压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.0/kissy-magix-mxext.js (KISSY类库，Magix核心与扩展未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.0/kissy-magix-mxext-min.js (KISSY类库，Magix核心与扩展压缩版)<br />

http://a.tbcdn.cn/apps/e/magix/1.0/seajs-magix.js (sejs+jq类库，Magix核心未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.0/seajs-magix-min.js (sejs+jq类库，Magix核心压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.0/seajs-magix-mxext.js (sejs+jq类库，Magix核心与扩展未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.0/seajs-magix-mxext-min.js (sejs+jq类库，Magix核心与扩展压缩版)<br />

http://a.tbcdn.cn/apps/e/magix/1.0/requirejs-magix.js (requirejs+jq类库，Magix核心未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.0/requirejs-magix-min.js (requirejs+jq类库，Magix核心压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.0/requirejs-magix-mxext.js (requirejs+jq类库，Magix核心与扩展未压缩版)<br />
http://a.tbcdn.cn/apps/e/magix/1.0/requirejs-magix-mxext-min.js (requirejs+jq类库，Magix核心与扩展压缩版)<br />

##Magix 1.1与Magix1.0的使用差异：

####ModelManager中的4处回调参数调整：<br />

1.fetchAll调整<br />
   原来fetchAll回调参数：<br />
```
fetchAll([{},{},...],function(m1,m2,m3...,errs){//model对象在前 error对象在后

});
```

<br />
现在调整为：<br />
```
fetchAll([{},{},...],function(errs,m1,m2,m3...){//error对象在前，model对象在后

});
```

2.fetchOrder调整<br />
   原来fetchOrder回调参数：<br />
```
fetchOrder([{},{},...],function(model,errs,preErrors,preResults){//

});
```

<br />
现在调整为：<br />
```
fetchOrder([{},{},...],function(errs,model,preErrors,preResults){//

});
```

3.fetchOne调整<br />
   原来fetchOrder回调参数：<br />
```
fetchOne([{},{},...],function(model,errs,preErrors,preResults){//

});
```

<br />
现在调整为：<br />
```
fetchOne([{},{},...],function(err,model,preErrors,preResults){//

});
```

4.next调整<br />
   原来next回调参数：<br />
```
request.next(function(request,preReturned1,preReturned2...,errs){//

});
```

<br />
现在调整为：<br />
```
request.next(function(errs,preReturned1,preReturned2...){//去掉了request，同时err前置

});
```
####事件部分

原来写法：
```
return View.extend({
   //...
   render:function(){
      //调用
      this.events.click.test({});
   },
   events:{
      click{
         test:function(e){
            //code
         }
      }
   }
});
```

现在写法：<br />

```
return View.extend({
   //...
   render:function(){
      //调用
      this.test({});
   },
   'test<click>':function(e){
      //code
   }
});
```
####model与modelmanager
原来：
```
//app base model

return MxextMode.extend({
   urlMap:{
      groups:{
         i1:'/api/userinfo.json',
         i2:'/api/list.json'
      }
   },
   sync:function(options){
      var url=this.url();
      IO({
         url:url,
         //...
         success:options.success,
         error:options.error
      });
   }
});

//app model manager

var MM=MxextManager.create(AppBaseModel);

MM.registerModels([
   name:'Interface_1',
   uri:'groups:i1',
   urlParams:{
      action:'get'
   }
]);

```

现在：

```
//app base model

return MxextMode.extend({
   sync:function(callback){
      var url=this.get('url');

      IO({
         url:url,
         //...
         success:function(data){
            callback(null,data);
         },
         error:function(msg){
            callback(msg||'request error');
         }
      });
   }
});

//app model manager

var MM=MxextManager.create(AppBaseModel);

MM.registerModels([
   name:'Interface_1',
   url:'/api/getuserinfo.json',
   urlParams:{
      action:'get'
   }
]);

```
原来需要在model的urlMap中定义之后，在modelmanager中再次定义，1.1直接把url放在modelmanager中进行维护，model只做parse和sync<br />
即：原来在model中填写的三个空：urlMap,parse,sync在1.1中变为两个空：parse,sync


<br /><br />
####其它
启动入口：<br />
原来：
```
Magix.start({

});
```
现在<br />
```
KISSY.use('magix/magix',function(S,Magix){
   Magix.start({

   });
});
```
Magix不再做为全局变量提供，请require magix/magix模块使用里面的功能

项目包配置：<br />
原来在Magix.start中传递appHome appTag之类的Magix会自动帮你配置包信息，现在需要开发者自已配置<br />
```
原来:
Magix.start({
   appHome:'./',
   appTag:new Date().getTime(),
   debug:true
   //...
});

现在：
KISSY.use('magix/magix',function(S,Magix){
   S.config({
      packages:[
         {
            name:'app',
            tag:new Date().getTime()
         }
      ]
   });

   Magix.start({
      iniFile:'app/ini',
      rootId:'magix_vf_root'
   });
});
```

移除postMessageTo,receiveMessage
<br />
<br />
<br />


## Magix 1.0稳定版(2013-07-22)
1. 移动版与pc版
2. 增加seajs与requirejs
3. 完善API文档


## Magix 1.0升级简介

1. 拆分出magix核心与magix扩展两大块
2. 全新的Router解析引擎，全面支持history state和hash，支持二者之间平滑切换
3. 增强的view，丰富的自定义事件和资源管理，DOM事件全面支持不冒泡的事件
4. 支持底层类库切换，解除对底层类库MVC的依赖
5. 全新的代码组织方式，高内聚，低耦合
6. 改进的渲染流程和事件派发


## 简介

<http://magixjs.github.com/>

Magix适合用来构建大型的,面向前后端开发者以及IE6友好的,基于MVC结构和Hash驱动的OPOA(One Page One Application)应用.

Magix对View进行了父子结构抽象,通过VOM(View Object Model)对象,管理带有父子关系的View的展示生命周期.

Magix特别注意避免单页应用的浏览器内存大量积累和内存泄露.包括:

1.采取Dom节点即用即释放的方法,保障永不持有Dom节点

2.采用全新的事件代理方案,高效解耦Dom节点与事件响应体

Magix基于"约定大于配置"设计原则,可以快速构建可扩展的大型单页面Web应用.同时也特别注意保障可配置性和可扩展性