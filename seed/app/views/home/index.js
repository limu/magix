KISSY.add("~seed/app/views/home/index", function(S, View, MM) {
    return View.extend({
    	init : function() {
    		//监听url参数
			//this.observeLocation(['start', 'end', 'tab']);
            S.use('magix/router',function(S,R){
                R.on('change',function(e){
                    if(Math.random()<0.5){
                    e.back();
                }
                });
            });
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
    requires: ["mxext/view", "~seed/app/models/modelmanager"]
});