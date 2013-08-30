/**
 * @fileOverview Model
 * @version 1.0
 * @author 行列
 */
define('mxext/model', ['magix/magix'], function(require) {
    var Magix = require('magix/magix');
    var Extend = function(props, ctor) {
        var me = this;
        var BaseModel = function() {
            BaseModel.superclass.constructor.apply(this, arguments);
            if (ctor) {
                Magix.safeExec(ctor, arguments, this);
            }
        };

        Magix.mix(BaseModel, me, {
            prototype: true
        });

        return Magix.extend(BaseModel, me, props);

    };
    eval(Magix.include('../tmpl/model', 1));
    return Model;
});