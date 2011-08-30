(function() {
	//seajs配置
	//通过alies配置top-level模块采用debug版本,配置appp,config,libs的实际地址
	seajs.config({
		debug : 0
	});
	//启动Magix
	Magix.History.init({
		multipage : true,
		pathPrefix : "/git/magix/examples/multipage"
	});
})();
