define("magix/impls/template",["magix/mu"],function(require){
    var Template={};
    var Mustache = require("magix/mu");
    Template.toHTML=function(ops){
        ops=this.processOptions(ops);
        return Mustache.to_html(ops.template,ops.data);
    };
    return Template;
});