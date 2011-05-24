define(function(){
    var config = {};
    config.indexPath = "/home";
    config.notFoundPath = "/404";
    config.defaultViewMod = "app/views/default";
    var c2v = {
        "/404": "",
        "/home": "",
        "/test": "app/views/test",
        "/colors": "app/views/colors/outer"
    };
    config.controller2view = c2v;
    return config;
});
