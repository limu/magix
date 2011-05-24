define(function(){
    var config = {};
    config.indexPath = "/home";
    config.notFoundPath = "/404";
    config.defaultViewName = "app/views/default";
    var p2v = {
        "/404": "",
        "/home": "",
        "/test": "app/views/test",
        "/colors": "app/views/colors/outer"
    };
    config.pathViewMap = p2v;
    return config;
});
