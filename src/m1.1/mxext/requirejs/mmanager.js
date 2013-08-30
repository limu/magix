/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.0
 **/
define("mxext/mmanager", ["magix/magix", "magix/event"], function(Magix, Event) {
    /*
        #begin mm_fetchall_1#
        define('testMM',["mxext/mmanager","mxext/model"],function(MM,Model){
        #end#

        #begin mm_fetchall_2#
        });
        #end#

        #begin mm_fetchall_3#
        requirejs('testMM',function(TM){
        #end#
     */
    eval(Magix.include('../tmpl/mmanager', 1));
    return MManager;
});