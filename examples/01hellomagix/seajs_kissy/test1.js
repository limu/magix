onmessage=function(e){
	var data=e.data;
	postMessage('test1{{{{'+data+'}}}}}test1');
};