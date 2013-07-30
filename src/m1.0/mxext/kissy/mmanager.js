/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.0
 **/
KISSY.add("mxext/mmanager", function(S, Magix, Event) {
    eval(Magix.include('../tmpl/mmanager', 1));
    return MManager;
}, {
    requires: ["magix/magix", "magix/event"]
});