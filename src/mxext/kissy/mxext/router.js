KISSY.add("mxext/router",function(S,R,E){
	var W=window;
	R.useState=function(){
        var me=this,initialURL=location.href;
        var lastHref=initialURL;
        var newHref;
        E.on(W,'popstate',function(e){
        	var newHref=location.href;
            var equal=newHref==initialURL;
            if(!me.$firedPop&&equal)return;
            me.$firedPop=true;
            console.log('push?',e.type,e.state);
            if(newHash!=lastHref){
            	e={
        			prevent:function(){
        				this.$stop=1;
        			},
        			location:me.parseQH(newHref)
        		};
        		me.fire('change',e);
        		if(e.$stop){
        			history.replaceState(new Date().getTime(),document.title,lastHref);
        		}else{
        			lastHref=newHref;
        			me.route();
        		}
            }
        });
    };
	R.useHash=function(){
		var me=this,lastHash=me.parseQH().srcHash;
		var newHash;
        E.on(W,'hashchange',function(e,loc){
        	loc=me.parseQH();
        	newHash=loc.srcHash;
        	if(newHash!=lastHash){
        		e={
        			prevent:function(){
        				this.$stop=1;
        			},
        			location:loc
        		};
        		me.fire('change',e);
        		if(e.$stop){
        			location.replace('#!'+lastHash);
        		}else{
        			lastHash=newHash;
        			me.route();
        		}
        	}
        });
	}
},{
	requires:["magix/router","event"]
});