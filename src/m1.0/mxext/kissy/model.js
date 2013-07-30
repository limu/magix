/**
 * @fileOverview Model
 * @version 1.0
 * @author 行列
 */
KISSY.add("mxext/model", function(S, Magix) {
    var Extend = function(props, ctor) {
        var BaseModel = function() {
            BaseModel.superclass.constructor.apply(this, arguments);
            if (ctor) {
                Magix.safeExec(ctor, [], this);
            }
        }
        Magix.mix(BaseModel, this, {
            prototype: true
        });
        ProcessObject(props, this.prototype);
        return S.extend(BaseModel, this, props);
    };
    eval(Magix.include('../tmpl/model', 1));
    Model.prototype.beginTransaction = function() {
        var me = this;
        me.$bakAttrs = S.clone(me.$attrs);
    };
    return Model;
}, {
    requires: ["magix/magix"]
});