define(function(require, exports, module){
    var config = {};
    config.uri = module.uri;
    config.indexPath = "/home";
    config.notFoundPath = "/404";
    config.defaultViewName = "app/views/default";
    var p2v = {
        "/404": "",
        "/home": "",
        "/test": "app/views/test",
        "/colors": "app/views/colors/outer",
        "/demo/card": "app/views/demo/frame",
        "/demo/list": "app/views/demo/frame",
        "/target/a": "app/views/target/a"
    };
    config.pathViewMap = p2v;
    return config;
});
