/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
define("magix/body",["magix/magix"],function(require){
    //todo dom event and sizzle
    var Magix=require("magix/magix");
    var Has = Magix.has;
//不支持冒泡的事件
var UnsupportBubble = Magix.listToMap('submit,focusin,focusout,mouseenter,mouseleave,mousewheel,change');
var RootNode = document.body;
var RootEvents = {};


var MxOwner = 'mx-owner';
var MxIgnore = 'mx-ie';
var TypesRegCache = {};
var IdCounter = 1 << 16;

var IdIt = function(dom) {
    return dom.id || (dom.id = 'mx-e-' + (IdCounter--));
};
var GetSetAttribute = function(dom, attrKey, attrVal) {
    if (attrVal) {
        dom.setAttribute(attrKey, attrVal);
    } else {
        attrVal = dom.getAttribute(attrKey);
    }
    return attrVal;
};
var VOM;
var Body = {
    unbubble: Magix.unimpl,

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
                var handler = GetSetAttribute(current, MxOwner); //current.getAttribute(MxOwner);
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
            RootEvents[type] = 1;
            var unbubble = UnsupportBubble[type];
            if (unbubble) {
                me.unbubble(0, RootNode, type);
            } else {
                RootNode['on' + type] = function(e) {
                    e = e || window.event;
                    if (e) {
                        me.process(e);
                    }
                };
            }
        } else {
            RootEvents[type]++;
        }
    },
    un: function(type) {
        var me = this;
        var counter = RootEvents[type];
        if (counter > 0) {
            counter--;
            if (!counter) {
                var unbubble = UnsupportBubble[type];
                if (unbubble) {
                    me.unbubble(1, RootNode, type);
                } else {
                    RootNode['on' + type] = null;
                }
            }
            RootEvents[type] = counter;
        }
    }
};
    Body.unbubble=function(remove,node,type){
    	var fn=remove?'undelegate':'delegate';
        $(node)[fn]('[mx-'+type+']',type,Body.process);
    };
    return Body;
});