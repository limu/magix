define("magix/ajax", ["magix/impls/ajax", "magix/base"], function(require) {
    var impl = require("magix/impls/ajax");
    var Base = require("magix/base");
    var Ajax;
    eval(Base.include("tmpls/ajax"));
    return Base.implement(Ajax,impl);
});