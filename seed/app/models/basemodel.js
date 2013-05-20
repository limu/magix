KISSY.add("~seed/app/models/basemodel",function(S, MxModel,IO){
    var MxConfig=Magix.cfg;
    var Model;
    var SyncCounter=0;
    /**
     * 流控对象
     * @type {Object}
     * 设计思路：
     * 整体项目中的数据请求出口统一在app/common/models/model中的sync方法，所以在该方法内对返回的数据进行检查是否需要流控介入
     *     假设某个时间段时有6个ajax请求
     *     前3个几乎同时发起，而此时需要登录
     *     则3个中最先返回的请求介入流控，另外2个
     *         1.如果流控未结束，数据返回，则追加到流控等待列表中
     *         2.如果流控已结束，数据返回
     *             1.如果在有效时间内，则直接再发一次请求
     *             2.如果不在有效时间内，则流控再次介入
     *     后续3个请求：
     *         1.如果流控未结束则追加到等待列表中
     *         2.如果流控结束则正常请求
     */
    var ProcessController={
        /**
         * 状态码映射
         * @type {Object}
         */
        CodeMap:{
            601:{//需要重新登录
                method:'processLogin',
                validTime:2*60*1000
            },
            2:{//验证码
                method:'processVCode',
                validTime:1*60*1000
            }
        },
        /**
         * 流控是否介入
         * @return {Boolean}
         */
        isIntervene:function(){
            return this.$ii;
        },
        /**
         * 处理登录
         * @param  {Integer} validTime       有效时间
         * @param  {Boolean} ignoreValidTime 是否忽略有效时间
         */
        processLogin:function(validTime,ignoreValidTime){
            /*
                弹出登录浮层？
                当登录成功后processCode处理下一个
             */
            var self=this;
            var lastTime=self.$lastLTime;
            if(!ignoreValidTime&&(!lastTime||S.now()-lastTime<validTime)){
                self.processCode();
            }else{
                //...
                self.$lastLTime=S.now();
                self.processCode();
            }
        },
        /**
         * 处理验证码
         * @param  {Integer} validTime       有效时间
         * @param  {Boolean} ignoreValidTime 是否忽略有效时间
         */
        processVCode:function(validTime,ignoreValidTime){
            /*
                弹出层处理验证码？
                当验证码验证成功后调用processCode处理下一个
             */
            var self=this;
            var lastTime=self.$lastVCTime;
            if(!ignoreValidTime&&(!lastTime||S.now()-lastTime<validTime)){
                self.processCode();
            }else{
                //...
                self.$lastVCTime=S.now();
                self.processCode();
            }
        },
        getJSONPToken:function(callback){

        },
        /**
         * 处理流控code
         */
        processCode:function(){
            var self=this;
            var code=self.$code;
            if(code){
                var c=code.list.shift();
                if(c){
                    delete code.hash[c.code];
                    var m=self.CodeMap[c.code];
                    if(m){
                        self[m.method](m.validTime,c.iVT);
                    }else{
                        throw new Error('unrecognize error code:'+c);
                    }
                }else{
                    self.runWaitModels();
                }
            }else{
                self.runWaitModels();
            }
        },
        /**
         * 流控开始
         * @param  {Integer} code 流控码
         * @param {Boolean} ignoreValidTime 是否忽略有效时间
         */
        start:function(code,ignoreValidTime){
            var self=this;
            if(!self.$code){
                self.$code={list:[],hash:{}};
                if(!Magix.has(self.$code.hash,code)){
                    self.$code.list.push({
                        code:code,
                        iVT:ignoreValidTime
                    });
                    self.$code.hash[code]=true;
                }
            }
            if(!self.$ii){
                self.$ii=true;
                self.processCode();
            }
        },
        /**
         * 添加等待的model对象
         * @param {Model} model   model对象
         * @param {Objet} options model发送请求时的选项对象
         */
        addWaitModel:function(model,options){
            var self=this;
            if(!self.$wmList)self.$wmList=[];
            self.$wmList.push({
                model:model,
                options:options
            });
        },
        /**
         * 运行等待中的model对象
         */
        runWaitModels:function(){
            var self=this;
            var list=self.$wmList;
            if(self.$ii){
                delete self.$ii;
                if(list){
                    for(var i=0,one;i<list.length;i++){
                        one=list[i];
                        one.model.sync(one.options);
                    }
                }
                self.$wmList=[];
            }
        }
    };
    return Model=MxModel.extend({
        /*urlMap:{
            processControl:{
                vcode:'./test.json',
                login:'./test.json'
            }
        },*/
        parse:function(resp){
            var dataType=this.get('dataType');
            if(!dataType||dataType=='json'){
                var data=resp.result;
                if (data) {
                    if(S.isString(data)){
                        data={
                            data:data
                        };
                    }else if(S.isArray(data)){
                        data={
                            list:data
                        }
                    }
                    if(resp.msg){
                        data.msg=resp.msg;
                    }
                    return data;
                }
            }else{
                return {
                    data:resp
                }
            }
            return {};
        },
        sync:function(options){
            //如果流控已经介入，则需要同步的model交给流控去处理
            SyncCounter++;
            if(SyncCounter==1){
                //Bar.show('正在处理...');
            }
            var model=this;
            if(ProcessController.isIntervene()){
                ProcessController.addWaitModel(model,options);
                return;
            }
            var gets,
                type = 'GET',
                url = model.url(),
                jsonp = model.get("jsonp"),
                async = model.get("async"), 
                data = model.getPostParams(),
                dataType=model.get('dataType')||'json',
                oldSucc = options.success;
            console.log(url);
            var params = {
                url:url,
                type:type,
                data:data,
                dataType:dataType,
                async: async === false ? false : true,
                success:function (data, msg, xhr) {
                    if(dataType=='json'){
                        if(data.code=='200'||data.code=="302"){
                            try {
                                oldSucc.apply(this, arguments);
                            } catch (e) {//方法执行出错
                                console.log(e);
                                options.error.call(this, e.message, e);
                            }
                        }else{
                            if(data.code=='601'){//需要控制的code 601 etc
                                var tryTimes=(options.tryTimes||0)+1;
                                options.tryTimes=tryTimes;
                                if(tryTimes>4){//如果5次还没搞定，那算了，流控有问题，提示出错
                                    delete options.tryTimes;
                                    options.error.call(this,'error data:'+data.code);
                                }else{
                                    ProcessController.addWaitModel(model,options);
                                    ProcessController.start(data.code,tryTimes==2);//第2次尝试时，忽略有效时间
                                }
                            }else if(data.code=='600'){//业务异常,msg可以提示
                                options.error.call(this,data.msg);
                            }else{//400~5xx异常，联调用
                                options.error.call(this,MxConfig.debug?data.msg:'系统出错，请刷新重试');
                            }
                        }
                    }else{
                        try {
                            oldSucc.apply(this, arguments);
                        } catch (e) {//方法执行出错
                            console.log(e);
                            options.error.call(this, e.message, e);
                        }
                    }
                },
                error:function(x,msg){
                    options.error(msg);
                },
                complete:function(){
                    SyncCounter--;
                    if(SyncCounter==0){
                        //Bar.hide()
                    }
                }
            };
            
            if(jsonp) {
                params.jsonp = (jsonp===true?'_c':jsonp);
                params.dataType = 'jsonp';
                params.type = 'get';
            } else {
                if(data) {
                    data = model.getPostParams();
                    params.data = data;
                    params.type = "POST";
                }else{
                    model.setUrlParams('t',S.now());
                }
            }
            gets = model.getUrlParams();
            if(gets){
                params.url = params.url + (~params.url.indexOf('?') ? '&' : '?') + gets;
            }
            console.log(params);
            return IO(params);
        }
    });
},{
    requires:["mxext/model","ajax"]
});
