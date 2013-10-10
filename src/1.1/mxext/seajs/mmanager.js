/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.0
 **/
define("mxext/mmanager", ["magix/magix", "magix/event"], function(require) {
    /*
        #begin mm_fetchall_1#
        define('testMM',["mxext/mmanager","mxext/model"],function(require){
            var MM=require("mxext/mmanager");
            var Model=require("mxext/model");
        #end#

        #begin mm_fetchall_2#
        });
        #end#

        #begin mm_fetchall_3#
        seajs.use('testMM',function(TM){
        #end#
     */
    var Magix = require("magix/magix");
    var Event = require("magix/event");
    eval(Magix.include('../tmpl/mmanager', 1));
    return MManager;
});