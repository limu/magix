## Magix 1.0升级简介

1. 拆分出magix核心与magix扩展两大块
2. 全新的Router解析引擎，全面支持history state和hash，支持二者之间平滑切换
3. 增强的view，丰富的自定义事件和资源管理，DOM事件全面支持不冒泡的事件，在magix的扩展view中还加入了queryEvents，轻松应对复杂的业务场景
4. 支持底层类库切换，解除对底层类库MVC的依赖
5. 全新的代码组织方式，高内聚，低耦合，Router可单独使用
6. 改进的渲染流程和事件派发





MagixJS是Backbone.js的扩展.适合用来构建大型的,面向前后端开发者以及IE6友好的,基于MVC结构和Hash驱动的OPOA(One Page One Application)应用.

<http://magixjs.github.com/>


## 简介

MagixJS使用seajs(<http://seajs.com/>)作为JavaScript Module Loader.解决模块化相关的依赖关系,异步加载,打包发布等系列问题.

MagixJS的MVC划分基于backbone.js(<http://documentcloud.github.com/backbone/>),通过seajs的模块化改造使得按需加载成为可能.

MagixJS对Controller和Router进行了重新定义,Router将浏览器hash值根据配置自动驱动对应的View来展现.

MagixJS进行了View进行了父子结构抽象,通过VOM(View Object Model)对象,管理带有父子关系的Backbone View的展示生命周期.

MagixJS特别注意避免单页应用的浏览器内存大量积累和内存泄露.包括:

1.采取Dom节点即用即释放的方法,保障永不持有Dom节点

2.采用全新的事件代理方案,高效解耦Dom节点与事件响应体

3.限制JQuery的使用(Backbone小量依赖JQuery),从而让应用开发者在自己的代码里更好的控制内存使用

MagixJS使用Mustache.js(<http://mustache.github.com/>)作为模板引擎,并对Mustache做了一些扩展,支持简单的if判断等功能.

MagixJS基于"约定大于配置"设计原则,可以快速构建可扩展的大型单页面Web应用.同时也特别注意保障可配置性和可扩展性.
