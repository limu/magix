define(function(require){
    var View=require("magix/view");
    var S=KISSY;
    var HomeView=function(){
        HomeView.superclass.constructor.apply(this,arguments);
    };
    S.extend(HomeView,View);
    return HomeView;
});
