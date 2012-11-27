/**
 * @fileOverview 模板
 * @version 1.0
 * @author 行列
 */
KISSY.add("mxext/tmpl",function(S){
	var fnCaches={},
		tmplCaches={},
		stack='_'+new Date().getTime(),
		notRender=/\s*<script[^>]+type\s*=\s*(['"])\s*text\/tmpl\1[^>]*>([\s\S]*?)<\/script>\s*/gi;
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
					vars.push(p.replace(/[:+\-*\/&^%#@!~]/g,'$'));
					values.push(data[p]);
				}
			}
			fnKey=vars.join('_')+'_'+resultTemplate;
			if(!fnCaches[fnKey]){
				try{
					fnCaches[fnKey]=new Function(vars,resultTemplate);
				}catch(e){
					console.log(resultTemplate,vars,e);
					return resultTemplate=e.message;
				}
			}
			try{
				resultTemplate=fnCaches[fnKey].apply(data,values);
			}catch(e){
				console.log(resultTemplate,vars,e);
				resultTemplate=e.message;
			}
			return resultTemplate;
		}
		return template;
	};
	/**
	 * 语法为<# #>的模板，<# #>语句 <#= #>输出
	 * @name Tmpl
	 * @namespace
	 * @example
	 * &lt;#for(var i=0;i&lt;10;i++){#&gt;
	 *    &lt;#=i#&gt; &lt;br /&gt;
	 * &lt;#}#&gt;
	 */
	var Tmpl={
		/**
		 * @lends Tmpl
		 */
		/**
		 * 把模板与数据翻译成最终的字符串
		 * @param {String} template 模板字符串
		 * @param {Object} data     数据对象
		 * @return {String}
		 */
		toHTML:function(template,data){
			var notRenders=template.match(notRender);
			if(notRenders){
				template=template.replace(notRender,function(){//防止不必要的解析
					return '<script type="text/tmpl"></script>';
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
	return Tmpl;
});