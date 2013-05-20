KISSY.add("~seed/app/views/home/test", function(S, View, MM) {
    return View.extend({
    	init : function() {
    		//监听url参数
			//this.observeLocation(['start', 'end', 'tab']);
            //
            
            this.on('childrenCreated',function(e){
                console.log('childrenCreated');
            });
            this.on('childrenAlter',function(e){
                console.log('childrenAlter');
            });
            this.on('crated',function(e){
                console.log('crated');
            });
            this.on('alter',function(e){
                console.log('alter');
            });
		},
        render: function() {
            var me = this;
            var request = MM.fetchAll([{
                name: "Home_Index"
            }], function(MesModel,err) {
                me.setViewPagelet({
                    xx:MesModel.get("xx"),
                    groupId:me.location.get('groupId'),
                    showVf:Math.random()<.5
                });
            });
        },
        locationChange: function(e) {
        	this.render();
        },
        events:{
            click:{
                change:function(e){
                    e.view.navigate({
                        groupId:S.guid()
                    });
                }
            }
        }
    })
}, {
    requires: ["mxext/view", "~seed/app/models/modelmanager"]
});