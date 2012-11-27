/**
 * @fileOverview Model
 * @version 1.0
 * @author 行列
 */
KISSY.add("mxext/model",function(S,Magix){
    /**
     * Model类
     * @name Model
     * @namespace
     * @class
     * @constructor
     * @param {Object} ops 初始化Model时传递的其它参数对象
     * @property {String} uri 与后台接口对应的前端url key
     * @property {String} id model的唯一标识
     * @example
     * 项目中对Model的引用及配置：
     * KISSY.add("app/base/model",function(S,Model,io){
            return Model.extend(
                urlMap:{
                    'modules':{
                        'get':'/modules.jsp?action=get',
                        'set':'/modules.jsp?action=set'
                    }
                },
                parse:function(resp){
                    return resp;//可对返回的结果在这地方进行简单的处理
                },
                sync:function(model,ops){
                    var url=model.url();
                    var isJSONP=model.get('isJSONP');
                    return io({
                        url:url,
                        success:function(resp){
                            ops.success(resp);
                        }
                    });
                }
            });
        },{
            requires:["mxext/model","ajax"]
        });

        在view中的具体使用：

        render:function(){
            var m=new Model({
                uri:'modules:get'
            });
            m.load({
                success:function(data){
                    //TODO
                },
                error:function(msg){
                    //TODO
                }
            })
        }
     */
	var Model=function(ops){
        if(ops){
            this.set(ops);
        }
        this.id=S.guid('m');
        this.locker=false;
        this.hasLocker=false;
	};
    var ex=function(props,ctor){
        var fn=function(){
            fn.superclass.constructor.apply(this,arguments);
            if(ctor){
                Magix.safeExec(ctor,[],this);
            }
        }
        Magix.mix(fn,this,{prototype:true});
        return S.extend(fn,this,props);
    };
    Magix.mix(Model,{
        /**
         * @lends Model
         */
        /**
         * GET枚举
         * @type {String}
         */
        GET:'GET',
        /**
         * POST枚举
         * @type {String}
         */
        POST:'POST',
        /**
         * 继承
         * @function
         * @param {Object} props 方法对象
         * @param {Function} ctor 继承类的构造方法
         */
        extend:ex
    });


	Magix.mix(Model.prototype,{
        /**
         * @lends Model#
         */
        /**
         * url映射对象
         * @type {Object}
         */
        urlMap:{

        },
        /**
         * Model调用save或load方法后，与服务器同步的方法，供应用开发人员覆盖
         * @function
         * @param {Model} model model对象
         * @param {Object} ops 包含success error的参数信息对象
         * @return {XHR} 最好返回异步请求的对象
         */
        sync:Magix.noop,
        /**
         * 处理Model.sync成功后返回的数据
         * @function
         * @param {Object|String} resp 返回的数据
         * @return {Object}
         */
        parse:Magix.noop,
        /**
         * 获取通过setPostParams放入的参数
         * @return {String}
         */
        getPostParams:function () {
            return this.getParams("POST");
        },
        /**
         * 获取参数
         * @param {String} [key] 参数分组的key[Model.GET,Model.POST]，默认为Model.GET
         * @return {String}
         */
        getParams:function (key) {
            var me=this;
            if(!key){
                key=Model.GET;
            }else{
                key=key.toUpperCase();
            }
            var k='$'+key;
            var params=me[k];
            var arr=[];
            var v;
            if (params) {
                for (var p in params) {
                    v = params[p];
                    if (S.isArray(v)) {
                        for (var i = 0; i < v.length; i++) {
                            arr.push(p + '=' + encodeURIComponent(v[i]));
                        }
                    } else {
                        arr.push(p + '=' + encodeURIComponent(v));
                    }
                }
            }
            return arr.join('&');
        },
        /**
         * 设置get参数，只有未设置过的参数才进行设置
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         */
        setParamsIf:function (obj1, obj2) {
            this.setParams(obj1, obj2, Model.GET,true);
        },
        /**
         * 设置参数
         * @param {String}   key      参数分组的key
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         * @param {Boolean}   ignoreIfExist   如果存在同名的参数则不覆盖，忽略掉这次传递的参数
         * @param {Function} callback 对每一项参数设置时的回调
         */
        setParams:function (obj1,obj2,key,ignoreIfExist) {
            if(!key){
                key=Model.GET;
            }else{
                key=key.toUpperCase();
            }
            var me=this;
            if(!me.$keysCache)me.$keysCache={};
            me.$keysCache[key]=true;

            var k = '$' + key;
            if (!me[k])me[k] = {};
            if (S.isObject(obj1)) {
                for (var p in obj1) {
                    if (!ignoreIfExist || !me[k][p]) {
                        me[k][p] = obj1[p];
                    }
                }
            } else if(obj1&&obj2){
                if (!ignoreIfExist || !me[k][obj1]) {
                    me[k][obj1] = obj2;
                }
            }
        },
        /**
         * 设置post参数
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         */
        setPostParams:function (obj1, obj2) {
            var me = this;
            me.setParams(obj1, obj2,Model.POST);
        },
        /**
         * 设置post参数，只有未设置过的参数才进行设置
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         */
        setPostParamsIf:function(obj1,obj2){
        	var me=this;
        	me.setParams(obj1,obj2,Model.POST,true);
        },
        /**
         * 重置缓存的参数对象，对于同一个model反复使用前，最好能reset一下，防止把上次请求的参数也带上
         */
        reset:function () {
            var me=this;
            var keysCache=me.$keysCache;
            if(keysCache){
                for(var p in keysCache){
                    if(Magix.hasProp(keysCache,p)){
                        delete me['$'+p];
                    }
                }
                delete me.$keysCache;
            }
            var keys=me.$keys;
            var attrs=me.$attrs;
            if(keys){
                for(var i=0;i<keys.length;i++){
                    delete attrs[keys[i]];
                }
                delete me.$keys;
            }
        },
        /**
         * 获取model对象请求时的后台地址
         * @return {String}
         */
        url:function () {
            var self = this,
                uri = self.get('uri'),
                uris;
            if (uri) {
                uris = uri.split(':');
                var maps=self.urlMap;
                if(maps){
                    for (var i = 0, parent = maps; i < uris.length; i++) {
                        parent = parent[uris[i]];
                        if (parent === undefined) {
                            break;
                        } else if (i == uris.length - 1) {
                            uri=parent;
                        }
                    }
                }
            }else{
                
                throw new Error('model not set uri');
            }
            return uri;
        },
        /**
         * 获取属性
         * @param {String} key key
         * @return {Object}
         */
        get:function(key){
            var me=this;
            var attrs=me.$attrs;
            if(attrs){
                return attrs[key];
            }
            return null;
        },
        /**
         * 设置属性
         * @param {String|Object} key 属性对象或属性key
         * @param {Object} [val] 属性值
         */
        set:function(key,val,saveKeyList){
            var me=this;
            if(!me.$attrs)me.$attrs={};
            if(saveKeyList&&!me.$keys){
                me.$keys=[];
            }
            if(S.isObject(key)){
                for(var p in key){
                    if(saveKeyList){
                        me.$keys.push(p);
                    }
                    me.$attrs[p]=key[p];
                }
            }else if(key){
                if(saveKeyList){
                    me.$keys.push(key);
                }
                me.$attrs[key]=val;
            }
        },
        /**
         * 加载model数据
         * @param {Object} ops 请求选项
         */
        load:function(ops){
            this.request(ops);
        },
        /**
         * 保存model数据
         * @param {Object} ops 请求选项
         */
        save:function(ops){
            this.request(ops);
        },
        /**
         * 向服务器请求，加载或保存数据
         * @param {Object} ops 请求选项
         */
        request:function(ops){
            if(!ops)ops={};
            var success=ops.success;
            var error=ops.error;
            var me=this;
            if(!me.hasLocker||!me.locker){
                me.$abort=false;
                me.locker=me.hasLocker;
                ops.success=function(resp){
                    me.locker=false;
                    if(!me.$abort){
                        if(resp){
                            var val=me.parse(resp);
                            if(val){
                                if(S.isArray(val)){
                                    val={
                                        list:val
                                    };
                                }
                                me.set(val,null,true);
                            }
                        }
                        if(success){
                            success.apply(this,arguments);
                        }
                    }
                };
                ops.error=function(){
                    me.locker=false;
                    if(!me.$abort){
                        if(error)error.apply(this,arguments);
                    }
                };
                me.$trans=me.sync(me,ops);
            }
        },
        /**
         * 中止请求
         */
        abort:function(){
            var me=this;
            if(me.$trans&&me.$trans.abort){
                me.$trans.abort();
            }
            delete me.$trans;
            me.$abort=true;
        },
        /**
         * 开始事务
         * @example
         * //...
         * var userList=m.get('userList');//从model中取出userList数据
         * m.beginTransaction();//开始更改的事务
         * userList.push({userId:'123',userName:'xinglie'});//添加一个新用户
         * m.save({
         *     //...
         *     success:function(){
         *           m.endTransaction();//成功后通知model结束事务  
         *     },
         *     error:function(){
         *         m.rollbackTransaction();//出错，回滚到原始数据状态
         *     }
         * });
         * //应用场景：
         * //前端获取用户列表，添加，删除或修改用户后
         * //把新的数据提交到数据库，因model是数据的载体
         * //可能会直接在model原有的数据上修改，提交修改后的数据
         * //如果前端提交到服务器，发生失败时，需要把
         * //model中的数据还原到修改前的状态(当然也可以再次提交)
         * //
         * //注意：
         * //可能添加，删除不太容易应用这个方法，修改没问题
         * //
         */
        beginTransaction:function(){
            var me=this;
            me.$bakAttrs=S.clone(me.$attrs);
        },
        /**
         * 回滚对model数据做的更改
         */
        rollbackTransaction:function(){
            var me=this;
            var bakAttrs=me.$bakAttrs;
            if(bakAttrs){
                me.$attrs=bakAttrs;
                delete me.$bakAttrs;
            }
        },
        /**
         * 结束事务
         */
        endTransaction:function(){
            delete this.$bakAttrs;
        },
        /**
         * 给请求加锁，上个请求未完成时，不发起新的请求
         * @param {Boolean} locker 是否加锁
         */
        lock:function(locker){
            this.hasLocker=!!locker;
        }
	});
	return Model;
},{
    requires:["magix/magix"]
});