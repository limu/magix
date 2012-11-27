/**
 * @fileOverview Magix启动入口
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
(function(W){
	var noop=function(){};
	if(!W.console){
		W.console={
			log:noop,
			warn:noop,
			error:noop,
			debug:noop
		}
	}
	if(!W.Magix){
		W.Magix={
			start:function(cfg){
				this.$tempCfg=cfg;
			}
		}
		KISSY.use('magix/magix',function(S,M){
			var cfg=W.Magix.$tempCfg;
			W.Magix=M;
			if(cfg){
				M.start(cfg);
			}
		});
	}
})(this);