define("magix/template", ["magix/impls/template", "magix/base"], function(require) {
    var impl = require("magix/impls/template");
    var Base = require("magix/base");
    var Template;
    eval(Base.include("tmpls/template"));
    return Base.implement(Template,impl);
});