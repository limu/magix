define(function(require){
	var Model=require("magix/model");
	var m=new Model();
	console.log(m.toJSON());
	return require("magix/view").extend({});
});
