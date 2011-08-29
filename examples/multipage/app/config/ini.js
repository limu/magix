define(function(require, exports, module) {
	var config = {
		uri : module.id || module.uri
	};
	config.indexPath = "/home";
	config.notFoundPath = "/404";
	
	var inPageConfig = {
		"/home" : "app/views/home",
		"/404" : "app/views/404"
	};
	config.pathViewMap = {
		"/" : "app/views/index/root",
		"/index.html" : inPageConfig,
		"/page2.html" : inPageConfig
	};
	config.defaultRootViewName = "app/views/root";
	//config.defaultViewName = "app/views/layouts/default";
	return config;
});
