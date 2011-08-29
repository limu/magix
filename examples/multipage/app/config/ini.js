define(function(require, exports, module){
    var config = {
        uri: module.id || module.uri
    };
    config.indexPath = "/home";
    config.notFoundPath = "/404";
    var inPageConfig = {
        "/home": "app/views/home",
        "/404": "app/views/404"
    };    
    config.pathViewMap = {
    	"/":inPageConfig,
    	"/index.html":inPageConfig,
    	"/page2.html":inPageConfig
    }
    

    //config.defaultViewName = "app/views/layouts/default";
    return config;
});
