/**
 * @fileOverview Model
 * @version 1.0
 * @author 行列
 */
define("mxext/model", ["magix/magix"], function(require) {

    var Extend = function(props, ctor) {
        var me = this;
        var BaseModel = function() {
            BaseModel.superclass.constructor.apply(this, arguments);
            if (ctor) {
                SafeExec(ctor, arguments, this);
            }
        }

        Magix.mix(BaseModel, me, {
            prototype: true
        });

        return Magix.extend(BaseModel, me, props);

    };
    eval(Magix.include('../tmpl/model', 1));
    Model.prototype.beginTransaction = function() {
        throw new Error('unsupport');
    };
    return Model;
});