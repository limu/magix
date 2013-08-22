﻿
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