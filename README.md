MagixJS是基于backbone.js的模块化扩展,适合用其来构建较大型的基于Hash驱动单页面Web应用.

<http://magixjs.github.com/>


## 简介

MagixJS使用seajs(<http://seajs.com/>)作为JavaScript Loader.解决模块依赖关系,异步加载,打包发布等系列问题.

MagixJS的MVC划分基于backbone.js(<http://documentcloud.github.com/backbone/>),通过seajs做模块化使得按需加载成为可能.

MagixJS定义了新的Router,将原本集中的Backbone Controller打散,Router将按照约定将Hash自动分发给对应的controller模块.

MagixJS进行了VOM(View Object Model)层抽象,用以管理带有父子关系的Backbone View的展示生命周期.

MagixJS使用内置多种手段,避免单页应用的浏览器内存大量积累和内存泄露.包括:
	限制JQuery的使用(Backbone依赖JQuery),避免结果集中Dom节点释放.
	采用全新的事件代理方案,高效解耦Dom节点与事件响应体.

MagixJS使用Mustache.js作为模板引擎

MagixJS基于"约定大于配置"设计原则,可以快速构建可扩展的大型单页面Web应用.同时也特别注意保障可配置性和可扩展性.

