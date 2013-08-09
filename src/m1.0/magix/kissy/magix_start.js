/**
 * @fileOverview Magix启动入口
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
(function(W) {
    document.createElement('vframe');
    var noop = function() {};
    if (!W.console) {
        W.console = {
            log: noop,
            info: noop,
            warn: noop
        }
    };
    var tempCfg, cCfg = {};
    if (!W.Magix) {
        W.Magix = {
            config: function(cfg) {
                for (var p in cfg) {
                    cCfg[p] = cfg[p];
                }
            },
            start: function(cfg) {
                tempCfg = cfg;
            }
        };
        KISSY.use('magix/magix', function(S, M) {
            W.Magix = M;
            M.config(cCfg);
            if (tempCfg) {
                M.start(tempCfg);
            }
        });
    }
})(this);