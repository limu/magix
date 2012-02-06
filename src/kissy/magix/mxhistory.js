if(!window.console) {
	window.console = {
		log : function(s) {
		},
		dir : function(s) {
		},
		warn : function(s) {
		},
		error : function(s) {
		}
	};
}
MxHistory = {
	config : {},
	hash : "",
	oldHash : null,
	showIframe : false,
	isIE : false,
	iframe : null,
	slient : false,
	interval : 50,
	intervalId : 0,
	iframeSrc : "",
	ready : false,
	hashListener : null,
	currentHash : "",
	init : function(config) {
		config = config || {};
		this.iframeSrc = config.iframeSrc || "mxhistory.html";
		this.config = config;
		this.hash = location.hash;
		this.oldHash = this.hash;
		this.isIE = navigator.userAgent.toLowerCase().indexOf("msie") > -1;
		var docMode = document.documentMode;
		this.showIframe = this.isIE && (!docMode || docMode < 8);
		this.wirteFrame(this.iframeSrc);
		this.regHashChange();
		if(!this.showIframe) {
			this.route(this.hash);
		}
	},
	regHashChange : function() {
		var self = this;
		if('onhashchange' in window && !this.showIframe) {
			window.onhashchange = function() {
				self.hashChange.call(self);
			};
		} else {
			this.intervalId = window.setInterval((function() {
				var hash = location.hash;
				if(hash != self.oldHash) {
					self.hashChange.call(self);
				}
			}), this.interval);
		}
	},
	hashChange : function() {
		this.hash = location.hash;
		this.oldHash = this.hash;
		if(!this.showIframe) {
			this.route(this.hash);
		} else {
			this.iframe.src = this.iframeSrc + "?" + (this.hash ? this.hash.substr(1) : "");
		}
	},
	frameLoad : function() {
		var h = Magix.History;
		if(h.iframe) {
			var ns = h.iframe.contentWindow.location.search.substr(1);
			h.hash = h.oldHash = "#" + ns;
			location.hash = ns;
		}
		this.route(this.hash);
	},
	route : function(hash) {
		if(hash.indexOf("?") === 0) {
			hash = hash.substr(1);
		}
		if(hash.indexOf("#") === 0) {
			hash = hash.substr(1);
		}
		if(hash.indexOf("!") === 0) {
			hash = hash.substr(1);
		}
		if(this.hashListener) {
			this.hashListener(hash);
		}
		this.ready = true;
		this.currentHash = hash;
	},
	wirteFrame : function() {
		var self = this;
		if(this.showIframe) {
			//document.write("<iframe onload='Magix.History.frameLoad();' id='MxHistory' src='" + this.iframeSrc + "?" + (this.hash ? this.hash.substr(1) : "") + "' width='90%'></iframe>");
			document.write("<iframe onload='Magix.History.frameLoad();' id='MxHistory' src='" + this.iframeSrc + "?" + (this.hash ? this.hash.substr(1) : "") + "' style='z-index:99998;visibility:hidden;position:absolute;' border='0' frameborder='0' marginwidth='0' marginheight='0' scrolling='no' ></iframe>");
		}
		window.setTimeout((function() {
			self.iframe = document.getElementById("MxHistory");
		}), 0);
	},
	setHashListener : function(fn) {
		this.hashListener = fn;
		if(this.ready) {
			fn(this.currentHash);
		}
	}
};