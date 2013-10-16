/// <reference path="createLexer.js"/>
/* mtmin(s)： 压缩 Mustache 模版。说明：
注释
多属性之间空白
文本中空白
style、script(javascript)、title、textarea 之间的不处理
pre 中的空白不处理，仍然去注释
去掉多余的属性引号
*/
module.exports = function() {
	var createLexer = require("./createLexer.js");
	var tag_eof = '$';
	var tag_endTag = 'endTag';
	var tag_startTag = 'startTag';
	var tag_text = 'text';
	var tag_comment = 'comment';
	var tag_doctype = 'doctype';
	var tag_tmplTag = 'tmplTag';
	var tag_attr = 'attr';
	var tag_startTag_end = 'startTag_end';
	var tag_pcdata = '#PCDATA';
	var tag_cdata = 'CDATA';
	var tag_whites = 'whites';

	function attrVal(s) {
		if (s.length > 1) {
			var c = s.charAt(0);
			var d = s.charAt(s.length - 1);
			if (c == '"' && d == '"' || c == "'" && d == "'")
				s = s.slice(1, -1);
		}
		return s;
	}
	var TemplateLexer = function() {

		var re_text_mt = /(?:(?!<[!\w/]|{{)[\s\S])+/;
		var re_text_special = /(?:(?!<[!\w/]|\$})[\s\S])+/;
		var re_comm = /<\!--[\s\S]*?-->/;
		var re_startTag = /<(\w+)/;
		// ((?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/;
		var re_endTag = /<\/(\w+)\s*>/;
		var re_doctype = /<![dD][oO][cC][tT][yY][pP][eE]\s(?:[^"'>]|"[^"]*"|'[^']*')*>/;
		var re_tmplTag_mt = /{{[\s\S]+?\}{2,3}/;
		var re_tmplTag_special = /\$}[\s\S]+?{\$|{%[\s\S]+?%}/;

		function PartEndTag(tagName, contentType) {
			var t = '</' + String(tagName).replace(/./g, function(c) {
				return '[' + c.toLowerCase() + c.toUpperCase() + ']';
			}) + '\\s*>';
			return [
				[RegExp('(?:(?!' + t + ')[\\s\\S])+'), function(all) {
					this.popState();
					return contentType;
				}],
				[re_endTag, function(all, tagName) {
					this.popState();
					return tag_endTag;
				}]
			];
		}

		var part_comm = [re_comm, function(all) { return tag_comment; }];
		var part_doctype = [re_doctype, function(all) { return tag_doctype; }];
		var part_endTag = [re_endTag, function(all, tagName) { return tag_endTag; }];
		var part_whites = [/\s+/, function(all) { return tag_whites; }];

		return function(special) {
			var re_tmplTag = special ? re_tmplTag_special : re_tmplTag_mt;
			var re_text = special ? re_text_special : re_text_mt;
			var re_attr = special ? /([\w\-:]+)(?:(\s*=\s*)("(?:(?!{%)[^"]|{%[\s\S]+?%})*"|'(?:(?!{%)[^']|{%[\s\S]+?%})*'|[^\s>]+))?/ : /([\w\-:]+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+))?/;
			var part_tmplTag = [re_tmplTag, function(all) { return tag_tmplTag; }];
			var theTagName;
			var isScript = false;
			var Lexer = createLexer({
				$: tag_eof,
				$ignore: [tag_comment],
				'': [
					[re_text, function(all) { return tag_text; }],
					part_comm,
					part_doctype,
					[re_startTag, function(all, tagName) {
						theTagName = tagName.toLowerCase();
						if (theTagName == 'script')
							isScript = true;
						this.pushState('inTag');
						return tag_startTag;
					}],
					part_endTag,
					part_tmplTag
				],
				inTag: [
					part_tmplTag,
					part_whites,
					[re_attr, function(all, name, eq, value) {
						if (isScript) {
							switch (name.toLowerCase()) {
								case "type":
									if (attrVal(value).toLowerCase() != "text/javascript")
										isScript = false;
									break;
								case "language":
									if (attrVal(value).toLowerCase() != "javascript")
										isScript = false;
									break;
							}
						}
						return tag_attr;
					}],
					[/\/?>/, function(all) {
						this.popState('inTag');
						switch (theTagName) {
							case 'title':
							case 'textarea':
								this.pushState('pcdata_' + theTagName);
								break;
							case 'script':
								if (isScript) {
									this.pushState('cdata_script');
									isScript = false;
								}
								break;
							case 'style':
								this.pushState('cdata_style');
								break;
						}
						return tag_startTag_end;
					}]
				],
				pcdata_title: PartEndTag('title', tag_pcdata),
				pcdata_textarea: PartEndTag('textarea', tag_pcdata),
				cdata_script: PartEndTag('script', tag_cdata),
				cdata_style: PartEndTag('style', tag_cdata)
			});
			return Lexer;
		};
	}();
	var MtLexer = TemplateLexer(false);
	var SpecialLexer = TemplateLexer(true);

	function Token(tag, text) {
		this.tag = tag;
		this.text = text;
	}
	Token.prototype.toString = function() {
		return this.text;
	};
	Token.prototype.toHtml = function() {
		var t = String(htmlEncode(this.text));
		switch (this.tag) {
			case tag_comment:
				return t.fontcolor('green');
			case tag_tmplTag:
				return t.fontcolor('blue');
			default:
				return t;
		}
	};
	function isSpecialTmpl(s) {
		if (s.indexOf('$}') != -1 && s.indexOf('{$') != -1 &&
			s.indexOf('{%') != -1 && s.indexOf('%}') != -1)
			return true;
		return false;
	}
	function collapseWhites(s) {
		if (/\S/.test(s)) {
			return s.replace(/\s+/g, ' ');
		}
		else {
			return ' ';
		}
	}
	function mtmin(s) {
		var isSpecial = isSpecialTmpl(s);
		var lx = (isSpecial ? SpecialLexer : MtLexer)(s);
		var a = [];
		var t;
		var pre = false;
		try {
			while ((t = lx.scan()).tag != tag_eof) {
				if (!pre && t.tag == tag_text) {
					var s = t.text;
					while ((t = lx.scan()).tag == tag_text) {
						s += t.text;
					}
					a.push(collapseWhites(s));
					if (t.tag == tag_eof)
						break;
				}
				switch (t.tag) {
					case tag_startTag:
					case tag_endTag:
						t.tagName = t.subMatches[0].toLowerCase();
						break;
				}
				switch (t.tag) {
					case tag_startTag:
						if (t.tagName == 'pre') {
							pre = true;
						}
						a.push(t.text);
						break;
					case tag_endTag:
						if (t.tagName == 'pre') {
							pre = false;
						}
						a.push(t.text);
						break;
					case tag_attr:
						var sm = t.subMatches;
						a.push(sm[0]);
						if (sm[1]) {
							var value = attrVal(sm[2]);
							if (!/^bx-/.test(sm[0]) && /^[\w\-.:]+$/.test(value))
								a.push('=' + value);
							else if (value.indexOf('"') != -1 && value.indexOf("'") == -1)
								a.push("='" + value + "'");
							else {
								a.push('="' + value.replace(/"/g, '&quot;') + '"');
							}
						}
						break;
					case tag_whites:
						a.push(collapseWhites(t.text));
						break;
					case tag_startTag_end:
                  		a.push(t.text == '/>' ? ' />' : '>');
                  		break;
					default:
						a.push(t.text);
				}
			}
		} catch (e) { throw e; }
		return a.join('');
	}

	var formatFileContent = function(html) {
		var html = html.replace(/<\!--[\s\S]*?-->/g, '').replace(/(bx-config|data-valid)\s*=\s*"([^"]*)"/g, function(m, key, cnt) {
			return key + '="' + cnt + '"';
		})//.replace(/'/g, '\\\'').replace(/[\r\n]/g, '\\r\\n');
		// console.log(html);
		html = html.replace(/\s+/g, ' ');
		//html = html.replace(/(?:\\r\\n ?)+/g, '\\n');
		// console.log(html);

		return html;
	};
	return mtmin;
}();
