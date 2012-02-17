KISSY.add("magix/tmpl",function(S){
	var fnCaches={},
		tmplCaches={},
		stack='_'+new Date().getTime(),
		notRender=/\s*<script[^>]+type\s*=\s*(['"])\s*text\/notRenderTemplate\1[^>]*>([\s\S]*?)<\/script>\s*/gi;
	var tmpl=function(template,data){
		if(template){
			var resultTemplate;
			resultTemplate=tmplCaches[template];
			if(!resultTemplate){
				resultTemplate=stack + ".push('" + template
				.replace(/\s+/g," ")
				.replace(/<#/g,"\r")
				.replace(/;*#>/g,"\n")
				.replace(/\\(?=[^\r\n]*\n)/g,"\t")
				.replace(/\\/g,"\\\\")
				.replace(/\t/g,"\\")
				.replace(/'(?=[^\r\n]*\n)/g,"\t")
				.replace(/'/g,"\\'")
				.replace(/\t/g,"'")
				.replace(/\r=([^\n]+)\n/g,"',$1,'")
				.replace(/\r/g,"');")
				.replace(/\n/g,";"+stack+".push('")+ "');return "+stack+".join('')";
				 tmplCaches[template]=resultTemplate;
			}
			var vars=[stack],values=[[]],fnKey;
			if(data){
				for(var p in data){
					vars.push(p);
					values.push(data[p]);
				}
			}
			fnKey=vars.join('_')+'_'+resultTemplate;
			if(!fnCaches[fnKey]){
				fnCaches[fnKey]=new Function(vars,resultTemplate);
			}
			resultTemplate=fnCaches[fnKey].apply(data,values);
			return resultTemplate;
		}
		return template;
	};
	return {
		toHTML:function(template,data){
			var notRenders=template.match(notRender);
			if(notRenders){
				template=template.replace(notRender,function(){//防止不必要的解析
					return '<script type="text/notRenderTemplate"></script>';
				});
				template=tmpl(template,data);
				var idx=0;
				template=template.replace(notRender,function(){
					return notRenders[idx++];
				});
			}else{
				template=tmpl(template,data);
			}
			return template;
		}
	};
});