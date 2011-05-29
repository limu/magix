define(function(require){
    var Mustache = require("mustache");
    function addFns(template, data){
        var ifs = getConditions(template);
        var key = "";
        for (var i = 0; i < ifs.length; i++) {
            key = "if(" + ifs[i] + ")";
            if (data[key]) {
                continue;
            }
            else {
                data[key] = buildFn(ifs[i]);
            }
        }
    }
    function getConditions(template){
        var ifregexp_ig = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/ig;
        var ifregexp_i = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/i;
        var gx = template.match(ifregexp_ig);
        var ret = [];
        if (gx) {
            for (var i = 0; i < gx.length; i++) {
                ret.push(gx[i].match(ifregexp_i)[1]);
            }
        }
        return ret;
    }
    function buildFn(key){
        key = key.split("==");
        var res = function(){
            var ns = key[0].split("."), value = key[1];
            var curData = this;
            for (var i = ns.length - 1; i > -1; i--) {
                var cns = ns.slice(i);
                var d = curData;
                try {
                    for (var j = 0; j < cns.length - 1; j++) {
                        d = d[cns[j]];
                    }
                    if (cns[cns.length - 1] in d) {
                        if (d[cns[cns.length - 1]].toString() === value) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                } 
                catch (err) {
                }
            }
            return false;
        };
        return res;
    }
    return {
        to_html: function(template, data){
            addFns(template, data);
            return Mustache.to_html.apply(this, arguments);
        }
    };
});


