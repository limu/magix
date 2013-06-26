KISSY.add("app/models/model",function(S,BaseModel){
    return BaseModel.extend({
        urlMap:{
            home:{
                index:'api/home.json',
                test:'notfound'
            },
            message:{
                number:'api/getUnreadNum.json'
            }
        }
    })
},{
    requires:["app/models/basemodel"]
})