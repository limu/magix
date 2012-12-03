KISSY.add("app/views/index",function(S,MxView,Tmpl,Event,Router){
	var minStep=0;
	var maxStep=7;

	return MxView.extend({
		enableRefreshAnim:true,

		init:function(){
			var me=this;
			me.observeLocation('page');
			var oldWidth=810,oldHeight=608;
			var resize=function(){
				var main=S.one('#main');
				var vHeight=S.DOM.viewportHeight()-20;
				var vWidth=S.DOM.viewportWidth()-20;

				var vScale=vHeight/oldHeight;
				var hScale=vWidth/oldWidth;
				var scale=Math.min(vScale,hScale);
				//console.log(vHeight,oldHeight,vWidth,oldWidth,scale);
				main.css({
					MozTransform:'scale('+scale+')',
					WebkitTransform:'scale('+scale+')',
					MozTransformOrigin:'0 0',
					WebkitTransformOrigin:'0 0',
					OTransform:'scale('+scale+')',
					OTransformOrigin:'0 0'
				});
				if(S.UA.ie){//Y的 webkit支持zoom
					main.css({zoom:scale});
				}
				var mainWrap=S.one('#main_wrap');
				var centerLeft=(vWidth-scale*oldWidth)/2;
				var centerTop=(vHeight-scale*oldHeight)/2;
				mainWrap.css({
					left:centerLeft+10,
					top:centerTop+10,
					position:'absolute'
				})
			};
			me.manage('win_resize',resize);
			var keyup=function(e){
				switch(e.keyCode){
					case Event.KeyCodes.LEFT:
					case Event.KeyCodes.UP:
					case Event.KeyCodes.PAGE_UP:
						if(me.currentStep>minStep){
							Router.navigate({
								page:me.currentStep-1
							});
						}
						break;

					case Event.KeyCodes.RIGHT:
					case Event.KeyCodes.DOWN:
					case Event.KeyCodes.SPACE:
					case Event.KeyCodes.PAGE_DOWN:
						if(me.currentStep<maxStep){
							Router.navigate({
								page:me.currentStep+1
							});
						}
						break;

					case Event.KeyCodes.HOME:
						Router.navigate({
							page:minStep
						});
						break;

					case Event.KeyCodes.END:
						Router.navigate({
							page:maxStep
						});
						break;
				}
			};

			var fn=function(){
				oldWidth=S.one('#main').width();
				oldHeight=S.one('#main').height();
				
				resize();
				S.one(window).on('resize',resize);
				S.one(document).on('keyup',keyup);
				S.one(document).on('keydown',function(e){
					switch(e.keyCode){
						case Event.KeyCodes.LEFT:
						case Event.KeyCodes.UP:
						case Event.KeyCodes.RIGHT:
						case Event.KeyCodes.DOWN:
						case Event.KeyCodes.HOME:
						case Event.KeyCodes.END:
						case Event.KeyCodes.SPACE:
						case Event.KeyCodes.PAGE_DOWN:
						case Event.KeyCodes.PAGE_UP:
							e.preventDefault();
							break;
					}
				});
				S.one(document).on('click',function(e){
					if(e.button==0&&!S.one('#main').contains(e.target)){
						keyup({
							keyCode:Event.KeyCodes.SPACE
						});
					}
				}).on('contextmenu',function(e){
					if(!S.one('#main').contains(e.target)){
						keyup({
							keyCode:Event.KeyCodes.UP
						});
						e.preventDefault();
					}
				});
			};
			if(me.rendered)fn();
			else me.bind('created',fn);
		},
		render:function(){
			var me=this;
			var loc=me.getLocation();
			var page=Number(loc.get('page'))||0;

			
			if(!me.pageMaster){
				me.pageMaster=me.template.replace(/^<!--page master-->([\s\S]*?)<!--[\s\S]*$/,'$1');
			}
			var title=/<div\s+class=[^>]*title[^>]*>([\s\S]*?)<\/div>/i;
			if(!me.pages){
				me.pages=[];
				me.pagesContents={
					page:0,
					subs:{
						'目录':{
							subs:{},
							page:1
						}
					}
				};
				me.pagesAnchors={

				};
				var subTitle=/<div\s+class=[^>]*main-sub[^>]*>([\s\S]*?)<\/div>/i;
				var anchor=/<a\s*name=(['"])(\w+)\1><\/a>/i;
				var tempPage=0;
				me.template.replace(/<!--page-->([\S\s]*?)(?=<!--|$)/g,function(m,a){
					if(subTitle.test(a)){
						var key=a.match(subTitle)[1];
						var titles=a.match(title);
						var sTitles=S.trim(titles[1]).split('-');
						var temp=me.pagesContents;
						for(var i=0;i<sTitles.length;i++){
							temp=temp.subs[sTitles[i]];
						}
						if(temp){
							temp.subs[key]={
								page:tempPage,
								subs:{}
							}
						}
					}
					if(anchor.test(a)){
						var acor=a.match(anchor)[2];
						me.pagesAnchors[acor]=tempPage;
					}
					me.pages.push(a);
					tempPage++
				});
				console.log(me.pagesContents,me.pagesAnchors);
			}
			maxStep=me.pages.length-1;
			
			if(page<minStep)page=minStep;
			else if(page>maxStep)page=maxStep;

			me.currentStep=page;
			var pageContent=me.pages[page];
			var subsTitleObj;
			var subsTitle=/<li>([\s\S]*?)<\/li>/gi;
			var linkTo=/<a\s*href=(['"])linkTo:(\w+)\1/gi;
			pageContent=pageContent.replace(title,function(m,a){
				if(S.trim(a)){
					var sTitles=S.trim(a).split('-');
					var temp=me.pagesContents;
					var ta=[];
					for(var i=0;i<sTitles.length;i++){
						ta.push('<a href="#!/ppt?page='+temp.subs[sTitles[i]].page+'">'+sTitles[i]+'</a>');
						temp=temp.subs[sTitles[i]];
					}
					subsTitleObj=temp;
					return '<div class="title">'+ta.join('-')+'</div>';
				}
				return m;
			});
			if(subsTitle.test(pageContent)){
				pageContent=pageContent.replace(subsTitle,function(m,a){
					a=S.trim(a);
					if(Magix.hasProp(subsTitleObj.subs,a)){
						return '<li><a href="#!/ppt?page='+subsTitleObj.subs[a].page+'">'+a+'</a></li>';
					}
					return m;
				});
			}
			if(linkTo.test(pageContent)){
				pageContent=pageContent.replace(linkTo,function(m,a,b){
					if(me.pagesAnchors[b]){
						return '<a class="bold" href="#!/ppt?page='+me.pagesAnchors[b]+'"';
					}
					return m;
				});
			}
			console.log(subsTitleObj);
			me.setViewHTML(Tmpl.toHTML(me.pageMaster,{
				page:page,
				pageContent:pageContent
			}));
			var fn=me.getManaged('win_resize');
			if(fn)fn();
		},
		locationChange:function(){
			this.render();
		}
	});
},{
	requires:["magix/view","mxext/tmpl","event","magix/router"]
});