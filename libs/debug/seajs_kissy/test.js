define("magix/t1",function(require){
    return {
        test:function(){
            console.log('t1.test');
        }
    }
});

define("test",["magix/t1"],function(require){
    var t1=require("magix/t1");
    return {
        test2:function(){
            t1.test();
        }
    }
});
