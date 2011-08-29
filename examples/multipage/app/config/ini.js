define(function(require, exports, module) {
	var config = {
		uri : module.id || module.uri
	};
	config.indexPath = "/home";
	config.notFoundPath = "/404";
	config.pathViewMap = {
		"/" : "app/views/index/root",
		"/index.html" : {
			"/home" : "app/views/home",
			"/404" : "app/views/404"
		},
		"/page2.html" : {
			"/home" : "app/views/home",
			"/404" : "app/views/404"
		}
	};
	config.defaultRootViewName = "app/views/root";
	//config.defaultViewName = "app/views/layouts/default";
	return config;
});
