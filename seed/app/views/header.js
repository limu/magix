KISSY.add("app/views/header", function(S, View, MM) {
    return View.extend({
        render: function() {
            var me = this;
            var request = MM.fetchAll([{
                name: "Message_Number"
            }], function(MesModel) {
                var number = MesModel.get("data");
                me.setViewPagelet({
                    mesNumber: number
                });
            }, function(msg) {
                //读取数据错误
                me.setViewHTML(msg);
            });
            me.manage(request);
        },
        locationChange: function(e) {
            if (e.location.pathname == '/home') { //回到首页后重读未读数据
                this.render();
            } else {
                if (Math.random() < 0.3) { //30%读取一次未读数据，防止一直不更新未读消息
                    this.render();
                }
            }
        }
    })
}, {
    requires: ["mxext/view", "app/models/modelmanager"]
});