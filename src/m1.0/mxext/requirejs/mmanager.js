/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.0
 **/
define("mxext/mmanager", ["magix/magix", "magix/event"], function(Magix, Event) {
    /*
        #begin example-1#
        define('testMM',["mxext/mmanager","mxext/model"],function(MM,Model){
            var TestMM=MM.create(Model);
            TestMM.registerModels([{
                name:'Test1',
                url:'/api/test1.json'
            },{
                name:'Test2',
                url:'/api/test2.json',
                urlParams:{
                    type:'2'
                }
            }]);
            return TestMM;
        });

        requirejs('testMM',function(TM){
            TM.fetchAll([{
                name:'Test1'
            },{
                name:'Test2'
            }],function(m1,m2,err){

            });
        });
        #end#
     */
    eval(Magix.include('../tmpl/mmanager', 1));
    return MManager;
});