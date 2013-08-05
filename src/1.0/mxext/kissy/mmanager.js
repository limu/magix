/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.0
 **/
KISSY.add("mxext/mmanager", function(S, Magix, Event) {
    /*
        #begin example-1#
        KISSY.add('testMM',function(S,MM,Model){
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
        },{
            requires:["mxext/mmanager","mxext/model"]
        });

        KISSY.use('testMM',function(S,TM){
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
}, {
    requires: ["magix/magix", "magix/event"]
});