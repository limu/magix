/**
 * 开始建立一个Magix应用:<br/>
 * 1.简历libs目录,放置libs/seajs,libs/magix相关文件<br/>
 * 2.建立index.html.<br/>
 * 3.建立名为mxhistory.html的空白html文件,与index.html放置在同一目录下.<br/>
 * 4.建立app,app/views,app/config目录,和app/config/ini.js文件.<br/>
 * 5.在index.html中先后引入seajs.js和magix.js<br/>
 * 6.通过seajs.config(alieas{libs:"path/to/libs",app:"path/to/app"});指定libs和app的实际地址.<br/>
 * 7.添加启动Maigx历史服务:Magix.History.init();<br/>
 * 8.参照ini_sample.js填写app/config/ini.js文件,主要填写首页和404页面地址,以及配置pathname对应的viewname.<br/>
 * TODO:创建应用详情链接
 * @module magix
 */
/**
 * Magix History 服务,为使基于Magix的Ajax应用能够在各种浏览器中都能够正常使用其"前进","后退"功能<br/>
 * 因为Backbone.History在IE6/7下存在<a href="https://github.com/documentcloud/backbone/issues/228" target="_blank">bug</a>,所以Maigx重写了这部分代码<br/>
 * 因为这部分代码中包含document.write.所以无法封装为seajs模块使用.且必须将magix.js通过外联方式&lt;script src='magix.js'>&lt;/script>节点直接引入页面.
 * @class History
 * @namespace Magix
 * @static
 */
(function(){
    if (!window.console) {
        window.console = {
            log: function(s){
               // alert(s);
            },
            dir: function(s){
                //alert(s);
            },
            warn: function(s){
                //alert("[warn]:" + s);
            },
            error: function(s){
                //alert("[error]:" + s);
            }
        };
    }
    Magix = window.Magix || {};
    Magix.History = Magix.History ||
    {
        hash: "",
        oldHash: null,
        showIframe: false,
        isIE: false,
        iframe: null,
        slient: false,
        interval: 50,
        intervalId: 0,
        iframeSrc: "",
        /**
         * Magix应用程序入口 启动History服务
         * @method init
         * @param {String} iframeSrc (可选,默认为"mxhistory.html") 用于IE6/7记录历史的iframe地址,注意需要填写相对于主页的相对路径.
         * @namespace Magix
         */
        init: function(iframeSrc, router){
            this.iframeSrc = iframeSrc || "mxhistory.html";
            this.hash = location.hash;
            this.oldHash = this.hash;
            this.isIE = navigator.userAgent.toLowerCase().indexOf("msie") > -1;
            var docMode = document.documentMode;
            this.showIframe = this.isIE && (!docMode || docMode < 8);
            this.wirteFrame(iframeSrc);
            this.regHashChange();
            this.router = router || function(query){
                seajs.use(['libs/magix/controller'], function(ctrl){
                    ctrl._route(query);
                });
            };
            if (!this.showIframe) {
                this.route(this.hash);
            }
        },
        regHashChange: function(){
            var self = this;
            if ('onhashchange' in window && !this.showIframe) {
                window.onhashchange = function(){
                    self.hashChange.call(self);
                };
            }
            else {
                this.intervalId = window.setInterval((function(){
                    var hash = location.hash;
                    if (hash != self.oldHash) {
                        self.hashChange.call(self);
                    }
                }), this.interval);
            }
        },
        hashChange: function(){
            this.hash = location.hash;
            this.oldHash = this.hash;
            if (!this.showIframe) {
                this.route(this.hash);
            }
            else {
                this.iframe.src = this.iframeSrc + "?" + (this.hash ? this.hash.substr(1) : "");
            }
        },
        frameLoad: function(){
            var h = Magix.History;
            if (h.iframe) {
                var ns = h.iframe.contentWindow.location.search.substr(1);
                h.hash = h.oldHash = "#" + ns;
                location.hash = ns;
            }//else{
            this.route(this.hash);
            //}
        },
        route: function(query){
            if (query.indexOf("#") === 0) {
                query = query.substr(1);
            }
            if (query.indexOf("?") === 0) {
                query = query.substr(1);
            }
            if (query.indexOf("!") === 0) {
                query = query.substr(1);
            }
            this.router(query);
            //dv.innerHTML = "<div>" + query + "</div>" + dv.innerHTML;
        },
        wirteFrame: function(){
            var self = this;
            if (this.showIframe) {
                //document.write("<iframe onload='Magix.History.frameLoad();' id='MxHistory' src='" + this.iframeSrc + "?" + (this.hash ? this.hash.substr(1) : "") + "' width='90%'></iframe>");
                document.write("<iframe onload='Magix.History.frameLoad();' id='MxHistory' src='" + this.iframeSrc + "?" + (this.hash ? this.hash.substr(1) : "") + "' style='z-index:99998;visibility:hidden;position:absolute;' border='0' frameborder='0' marginwidth='0' marginheight='0' scrolling='no' ></iframe>");
            }
            window.setTimeout((function(){
                self.iframe = document.getElementById("MxHistory");
            }), 0);
        }
    };
})();
