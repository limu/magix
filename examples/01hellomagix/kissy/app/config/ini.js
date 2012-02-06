//
KISSY.add(function(S){
	return {
		uri:"unknown",
		indexPath:"/home",
		notFoundPath:"/404",
		pathViewMap:{
			"/home":"app/views/home",
			"/404":"app/views/404"
		},
		defaultViewName:"app/views/layouts/default"
	}
});