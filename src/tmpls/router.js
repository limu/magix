Base.mix(Router, {
	//props
	config : null,
	appConfig : null,
	state : null,
	search : null,
	query : null,
	queryModel : null,
	rootViewName : null,
	oldRootViewName : null,
	postData : null,
	_locator : null,
	//abstract members
	getAppConfig : Base.unimpl,
	setStateListener : Base.unimpl,
	parseState : Base.unimpl,
	parseSearch : Base.unimpl,
	getRootViewName : Base.unimpl,
	createQueryModel : Base.unimpl,
	changeQueryModel : Base.unimpl,
	////todo goTo navigateTo setPostData
	navigateTo:Base.unimpl,
	setPostData:Base.unimpl,
	getVOMObject:Base.unimpl,
	//concrete members
	init : function(config) {
		this.config = config;
		this.appConfig = this.getAppConfig();
		this.setStateListener();
	},
	goTo:function(url){
		console.log(url);
		location.hash='!'+url;
	},
	route : function(stateString) {
		console.log("current state >>>> " + stateString);
		this.state = this.parseState(stateString);
		this.search = this.parseSearch();
		this._locator = {
			state : this.state,
			search : this.search
		};
		this.query = this._spreadLocator();
		this.oldRootViewName = this.rootViewName;
		this.rootViewName = this.getRootViewName();
		if(this.rootViewName){
			if(this.rootViewName == this.oldRootViewName) {
				this.changeQueryModel();
			}else{
				var vom=this.getVOMObject();
				this.queryModel = this.createQueryModel();
				this.queryModel.bind("change", function() {
					vom.notifyQueryModelChange(this);
	            });
				
				vom.mountRootView(this.rootViewName,this.queryModel);
			}
		}
		this.postData = null; //todo re-think postData
		delete this.$busy;
		this._runIdleList();
	},
	_spreadLocator : function() {
		var query = {};
		var locator = this._locator;
		Base.mix(query, locator.state.paraObj);
		Base.mix(query, {
			referrer : locator.state.referrer,
			query : locator.state.query,
			pathname : locator.state.pathName,
			postdata : locator.state.postData || null //todo postdata
		});
		var multipageQuery = {}, schKey, schPara = locator.search.paraObj;
		if(this.config.multipage || true) {//todo del ||true
			multipageQuery["sch:pathname"] = locator.search.pathName;
			multipageQuery["sch:query"] = locator.search.query;
			for(schKey in schPara) {
				multipageQuery["sch:" + schKey] = schPara[schKey];
			}
			Base.mix(query, multipageQuery);
		}
		return query;
	},
	_runIdleList:function(){
		console.log('_runIdleList');
		Magix._fireHashchangeListen();
		var me=this,
			list=me.$idleList;
		if(list){
			for(var i=0,j=list.length;i<j;i++){
				me.idle(list[i]);
				list.splice(i,1);
				i--;
				j--;
			}
		}
	},
	idle:function(fn){
		var me=this;
		if(me.$busy){
			if(!me.$idleList)me.$idleList=[];
			me.$idleList.push(fn);
		}else{
			try{
				fn();
			}catch(e){

			}
		}
	}
});
