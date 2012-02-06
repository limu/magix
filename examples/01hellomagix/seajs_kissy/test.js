onmessage=function(e){
	e.data.ref.a.b='a';
	var count=parseInt(e.data,10)||1000,
		result=['<ul>'];
	for(var i=0;i<count;i++){
		result.push('<li>',i,'</li>');
	}
	result.push('</ul>');
	/*var xhr=new XMLHttpRequest();
	xhr.open('GET','index.html',true);
	xhr.onreadystatechange=function(){
		var e=this;
		if(e.readyState==4&&/2\d{2}|304/.test(e.status)){
			result.push(e.responseText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
			postMessage(result.join(''));
		}		
	};
	xhr.send('');*/
	var worker=new Worker('test1.js');
	worker.onmessage=function(e){
		result.push(e.data);
		postMessage(result.join(''));
	};
	worker.postMessage('test');
};