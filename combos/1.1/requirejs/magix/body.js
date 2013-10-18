/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
define("magix/body", ["magix/magix"], function(Magix) {
    //todo dom event and sizzle
    var Has = Magix.has;
var Mix = Magix.mix;
//依赖类库才能支持冒泡的事件
var DependLibEvents = {};
var RootNode = document.body;
var RootEvents = {};
var MxEvtSplit = String.fromCharCode(26);

var MxOwner = 'mx-owner';
var MxIgnore = 'mx-ei';
var TypesRegCache = {};
var IdCounter = 1 << 16;

var IdIt = function(dom) {
    return dom.id || (dom.id = 'mx-e-' + (IdCounter--));
};
var GetSetAttribute = function(dom, attrKey, attrVal) {
    if (attrVal) {
        dom.setAttribute(attrKey, attrVal);
    } else if (dom && dom.getAttribute) {
        attrVal = dom.getAttribute(attrKey);
    }
    return attrVal;
};
var VOM;
var Body = {
    lib: Magix.unimpl,
    special: function(events) {
        Mix(DependLibEvents, events);
    },
    process: function(e) {
        var target = e.target || e.srcElement;
        while (target && target.nodeType != 1) {
            target = target.parentNode;
        }
        var current = target;
        var eventType = e.type;
        var eventReg = TypesRegCache[eventType] || (TypesRegCache[eventType] = new RegExp('(?:^|,)' + eventType + '(?:,|$)'));
        //
        if (!eventReg.test(GetSetAttribute(target, MxIgnore))) {
            var type = 'mx-' + eventType;
            var info;
            var ignore;
            var arr = [];
            while (current && current != RootNode) { //找事件附近有mx[a-z]+事件的DOM节点
                info = GetSetAttribute(current, type);
                ignore = GetSetAttribute(current, MxIgnore); //current.getAttribute(MxIgnore);
                if (info || eventReg.test(ignore)) {
                    break;
                } else {
                    //
                    arr.push(current);
                    current = current.parentNode;
                }
            }
            if (info) { //有事件
                //找处理事件的vframe
                var vId;
                var ts = info.split(MxEvtSplit);
                if (ts.length > 1) {
                    vId = ts[0];
                    info = ts.pop();
                }
                var handler = GetSetAttribute(current, MxOwner) || vId; //current.getAttribute(MxOwner);
                if (!handler) { //如果没有则找最近的vframe
                    var begin = current;
                    var vfs = VOM.all();
                    while (begin && begin != RootNode) {
                        if (Has(vfs, begin.id)) {
                            GetSetAttribute(current, MxOwner, handler = begin.id);
                            //current.setAttribute(MxOwner,handler=begin.id);
                            break;
                        } else {
                            begin = begin.parentNode;
                        }
                    }
                }
                if (handler) { //有处理的vframe,派发事件，让对应的vframe进行处理

                    var vframe = VOM.get(handler);
                    var view = vframe && vframe.view;
                    if (view) {
                        view.processEvent({
                            info: info,
                            se: e,
                            st: eventType,
                            tId: IdIt(target),
                            cId: IdIt(current)
                        });
                    }
                } else {
                    throw Error('miss ' + MxOwner + ':' + info);
                }
            } else {
                var node;
                while (arr.length) {
                    node = arr.shift();
                    ignore = GetSetAttribute(node, MxIgnore); //node.getAttribute(MxIgnore);
                    if (!eventReg.test(ignore)) {
                        ignore = ignore ? ignore + ',' + eventType : eventType;
                        GetSetAttribute(node, MxIgnore, ignore);
                        //node.setAttribute(MxIgnore,ignore);
                    }
                }
            }
        }
    },
    on: function(type, vom) {
        var me = this;
        if (!RootEvents[type]) {

            VOM = vom;
            RootEvents[type] = 0;
            var lib = DependLibEvents[type];
            if (lib) {
                me.lib(0, RootNode, type);
            } else {
                RootNode['on' + type] = function(e) {
                    e = e || window.event;
                    if (e) {
                        me.process(e);
                    }
                };
            }
        }
        RootEvents[type]++;
    },
    un: function(type) {
        var me = this;
        var counter = RootEvents[type];
        if (counter > 0) {
            counter--;
            if (!counter) {
                var lib = DependLibEvents[type];
                if (lib) {
                    me.lib(1, RootNode, type);
                } else {
                    RootNode['on' + type] = null;
                }
            }
            RootEvents[type] = counter;
        }
    }
};
    Body.lib = function(remove, node, type) {
        var fn = remove ? 'undelegate' : 'delegate';
        $(node)[fn]('[mx-' + type + ']', type, Body.process);
    };
    return Body;
});