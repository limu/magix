KISSY.add("~seed/app/models/model",function(S,BaseModel){
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
    requires:["~seed/app/models/basemodel"]
})