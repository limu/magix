KISSY.add("app/views/home/index", function(S, View, MM) {
    return View.extend({
    	init : function() {
    		//监听url参数
			//this.observeLocation(['start', 'end', 'tab']);
		},
        render: function() {
            var me = this;
            MM.fetchOrder([
                {name:'Home_Index1'},
                {name:'Home_Index'}
            ],function(m,e){
                console.log(m,e);
                return 'xx'
            },function(m1,e,preErrs){
                console.log(m1,e,preErrs);
                return 'yy';
            });
            var request = MM.fetchAll([{
                name: "Home_Index"
            }], function(MesModel,err) {
                console.log(arguments);
                me.setViewPagelet({xx:MesModel.get("xx")});
                            me.owner.mountVframe('T1','app/views/404?a=2',{a:'1'});
            me.owner.mountVframe('T2','app/views/404?a=2',{a:'2'})
                if(err){
                    console.log(err.msg);
                }
                return 'text';
            });

            request.next(function(r,args,error){
                console.log(arguments);
                r.fetchOrder([
                    {name:'Home_Index1'},
                    {name:'Home_Index'}
                ],function(m,e){
                    console.log(m,e);
                    return 'xx'
                },function(m1,e,preErrs){
                    console.log(m1,e,preErrs);
                    return 'yy';
                });
            });

            request.next(function(r,a1,a2,error){
                console.log(arguments);
            });

        },
        locationChange: function(e) {
            console.log(e);
        	this.render();
        },
        events:{
            click:{
                changeView:function(e){
                    e.view.navigate('/home/test?groupId='+S.guid());
                },
                changeHash:function(e){
                    e.view.navigate({
                        a:S.guid(),
                        b:S.guid()
                    });
                    console.log(e.view.location,e.view.location.get('b'));
                    e.view.navigate({
                        c:S.guid(),
                        d:S.guid()
                    });
                    console.log(e.view.location,e.view.location.get('d'));
                }
            }
        }
    })
}, {
    requires: ["mxext/view", "app/models/modelmanager"]
});