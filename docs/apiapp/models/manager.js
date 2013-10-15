/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/models/manager', function(S, MManager, Model, Magix) {
    var MM = MManager.create(Model);
    var InfosCache = Magix.cache();
    var SearchCache = Magix.cache(40);
    MM.registerModels([{
        name: 'Class_List',
        url: 'index.json',
        cacheKey: function(meta) {
            var infos = Magix.local('APIPathInfo');
            return meta.name + '_' + [infos.loader, infos.ver].join('_');
        },
        after: function(m) {
            var list = m.get('list');
            var coreList = [];
            var extList = [];
            var listMap = {};
            for (var i = 0, e; i < list.length; i++) {
                e = list[i];
                if (e.isCore) {
                    coreList.push(e);
                } else {
                    extList.push(e);
                }
                listMap[e.name] = e;
            }
            m.set('coreList', coreList);
            m.set('extList', extList);
            m.set('listMap', listMap);
        }
    }, {
        name: 'Class_Entity',
        cacheKey: function(meta, req) {
            var infos = Magix.local('APIPathInfo');
            return meta.name + '_' + [infos.loader, infos.ver, req.cName].join('_');
        },
        after: function(m) {
            var isa = m.get('isa');
            if (isa == 'CONSTRUCTOR') {
                var methods = m.get('methods');
                var staticMethods = [];
                var ms = [];
                for (var i = 0, e; i < methods.length; i++) {
                    e = methods[i];
                    if (e.isStatic) {
                        staticMethods.push(e);
                    } else {
                        ms.push(e);
                    }
                }
                m.set('methods', ms);
                m.set('staticMethods', staticMethods);

                var properties = m.get('properties');
                if (properties) {
                    var staticProperties = [];
                    var ps = [];
                    for (i = 0; i < properties.length; i++) {
                        e = properties[i];
                        if (e.isStatic) {
                            staticProperties.push(e);
                        } else {
                            ps.push(e);
                        }
                    }

                    m.set('properties', ps);
                    m.set('staticProperties', staticProperties);
                }
            }
        }
    }]);
    MM.registerMethods({
        fetchClassInfos: function(callback, view) {
            var infos = Magix.local('APIPathInfo');
            var key = [infos.loader, infos.ver, 'infos'].join('_');
            if (InfosCache.has(key)) {
                callback(null, InfosCache.get(key));
                return;
            }
            var r = MM.fetchAll({
                name: 'Class_List'
            }, function(e, m) {
                if (e) {
                    callback(e);
                } else {
                    var models = [];
                    var list = m.get('list');
                    for (var i = 0; i < list.length; i++) {
                        e = list[i];
                        models.push({
                            name: 'Class_Entity',
                            cName: e.name
                        });
                    }
                    return models;
                }
            }, view);
            r.next(function(e, results) {
                r.fetchAll(results, function(e) {
                    if (e) {
                        callback(e);
                    } else {
                        var args = arguments;
                        var map = {};
                        var list = [];
                        for (var i = args.length - 1; i > 0; i--) {
                            map[args[i].get('cName')] = args[i];
                            list.push(args[i]);
                        }
                        var result = {
                            map: map,
                            list: list
                        };
                        InfosCache.set(key, result);
                        callback(e, result);
                    }
                });
            });
            return r;
        },
        searchInfos: function(key, callback, view) {
            var temp = {
                stopped: 0,
                stop: function() {
                    this.stopped = 1;
                }
            };
            if (SearchCache.has(key)) {
                callback(null, SearchCache.get(key));
                return temp;
            }
            var findIn;
            var oKey = key;
            if (key.indexOf('@') > -1) {
                var ks = key.split('@');
                key = ks[0];
                findIn = ks[1];
            }
            var sign = view.sign;
            var testReg = new RegExp('(.*?)(' + key.split('').join(')(.*?)(') + ')(.*?)', 'i');
            var replacer = [];
            var start = key.length;
            var begin = 1;
            while (start > 0) {
                start--;
                replacer.push('$', begin, '($', begin + 1, ')');
                begin += 2;
            }
            replacer.push('$', begin);
            var searchResults = {
                replaceReg: testReg,
                replaceExp: replacer.join(''),
                key: key,
                nsGrouped: []
            };
            if (findIn) {
                findIn = new RegExp('(.*?)' + findIn.split('').join('(.*?)') + '(.*?)', 'i');
            }
            MM.fetchClassInfos(function(e, results) {
                if (e) {
                    callback(e);
                } else {
                    var search = function(list) {
                        var a = [];
                        for (var i = 0; i < list.length; i++) {
                            e = list[i];
                            MM._sKeyMaxLegth = Math.max(MM._sKeyMaxLegth, e._name.length);
                            if (testReg.test(e._name)) {
                                a.push(e);
                            }
                        }
                        return a;
                    };
                    var walker = function(list, index, max) {
                        var m = list[index];
                        var found;
                        var obj = {
                            name: m.get('_name')
                        };
                        var searchTypes = [
                            'methods',
                            'events',
                            'properties',
                            'staticMethods',
                            'staticProperties'
                        ];
                        for (var i = 0, r, o; i < searchTypes.length; i++) {
                            o = searchTypes[i];
                            r = m.get(o);
                            if (r) {
                                r = search(r);
                                if (r.length) {
                                    obj[o] = r;
                                    found = true;
                                }
                            }
                        }

                        if (found) {
                            searchResults.nsGrouped.push(obj);
                        }
                        if (!temp.stopped) {
                            if (index < max) {
                                setTimeout(function() {
                                    walker(list, index + 1, max);
                                }, 50);
                            } else {
                                SearchCache.set(oKey, searchResults);
                                if (sign == view.sign) {
                                    callback(null, searchResults);
                                }
                            }
                        }
                    };
                    if (MM._sKeyMaxLegth > -1 && MM._sKeyMaxLegth < key.length) {
                        callback(null, searchResults);
                    } else {
                        var list = results.list;
                        if (findIn) {
                            var a = [];
                            for (var i = 0, m; i < list.length; i++) {
                                m = list[i];
                                if (findIn.test(m.get('_name'))) {
                                    a.push(m);
                                }
                            }
                            list = a;
                        }
                        if (list && list.length) {
                            walker(results.list, 0, results.list.length - 1);
                        } else {
                            callback(null, searchResults);
                        }
                    }
                }
            }, view);
            return temp;
        }
    });
    MM._sKeyMaxLegth = -1;
    return MM;
}, {
    requires: ['mxext/mmanager', 'apiapp/models/model', 'magix/magix']
});