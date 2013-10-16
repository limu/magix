/// <reference path="jstable.js"/>
var jstable=require('./jstable');
var JsProc = function() {
	function Class(base, constructor, methods) {
		function f() { }
		f.prototype = base.prototype;
		var t = new f;
		if (methods) {
			for (var i in methods)
				t[i] = methods[i];
		}
		if (!constructor)
			constructor = f;
		constructor.prototype = t;
		return constructor;
	}

	function Position(row, col) {
		this.row = row;
		this.col = col;
	}
	Position.prototype.toString = function() {
		return '(' + this.row + ',' + this.col + ')';
	};

	function getPos(s, index) {
		var t = s.substring(0, index);
		var re_nl = /\r\n?|\n/g;
		var m = t.match(re_nl);
		var row = 1;
		if (m) {
			row += m.length;
		}
		var col = 1 + /[^\r\n]*$/.exec(t)[0].length;
		return new Position(row, col);
	}

	function Enum(arr) {
		var obj = {};
		for (var i = 0; i < arr.length; ++i)
			obj[arr[i]] = arr[i];
		return obj;
	}

	function inArr(a, t) {
		for (var i = 0; i < a.length; ++i)
			if (a[i] == t)
				return i;
		return -1;
	}
	function inArr_strict(a, t) {
		for (var i = 0; i < a.length; ++i)
			if (a[i] === t)
				return i;
		return -1;
	}
	function nodup(a, eq) {
		var b = [];
		var n = a.length;
		for (var i = 0; i < n; i++) {
			for (var j = i + 1; j < n; j++)
				if (eq(a[i], a[j]))
					j = ++i;
			b.push(a[i]);
		}
		return b;
	}
	function binarySearch(arr, comp, v) {
		var min = 0;
		var max = arr.length - 1;
		while (min <= max) {
			var mid = Math.floor((min + max) / 2);
			var t = comp(arr[mid], v);
			if (t < 0)
				min = mid + 1;
			else if (t > 0)
				max = mid - 1;
			else return mid;
		}
		return -1;
	}
	function minusArr(a, b) {
		var c = [];
		for (var i = 0; i < a.length; ++i)
			if (inArr(b, a[i]) == -1)
				c.push(a[i]);
		return c;
	}

	function htmlEncode(s) {
		return String(s).replace(/[&<>"]/g, function(a) {
			switch (a) {
				case '&': return '&amp;';
				case '<': return '&lt;';
				case '>': return '&gt;';
				default: return '&quot;';
			}
		});
	}

	function Token(tag, text, index, subMatches) {
		this.tag = tag;
		this.text = text;
		this.index = index;
		this.subMatches = subMatches;
	}
	Token.prototype.toString = function() {
		return this.text;
	};
	function createLexer(g) {
		function emptyFunc() { }
		function buildScanner(a) {
			var n = 1;
			var b = [];
			var matchIndexes = [1];
			var fa = [];
			for (var i = 0; i < a.length; ++i) {
				matchIndexes.push(n += RegExp('|' + a[i][0].source).exec('').length);
				fa.push(a[i][1] || emptyFunc);
				b.push('(' + a[i][0].source + ')');
			}

			var re = RegExp(b.join('|') + '|', 'g');
			return [re, matchIndexes, fa];
		}

		var endTag = g.$ || '$';
		var scanner = {};
		var hasUnnamed = false;
		for (var i in g) {
			if (i.charAt(0) != '$') {
				scanner[i] = buildScanner(g[i]);
				if (i == '') hasUnnamed = true;
			}
		}

		return Lexer;
		function Lexer(s) {
			if (typeof s != 'string')
				s = String(s);
			var Length = s.length;
			var i = 0;
			var stateStack = [''];

			var obj = hasUnnamed ? {
				pushState: function(s) {
					stateStack.push(s);
				},
				popState: function() {
					stateStack.pop();
				}
			} : {};

			function scanByRule(rule) {
				var re = rule[0];
				re.lastIndex = i;
				var t = re.exec(s);
				if (t[0] == '') {
					if (i < Length) {
						throw Error('lexer error: ' + getPos(s, i) +
							'\n' + JSON.stringify(s.slice(i, i + 50)));
					}
					return new Token(endTag, '', i);
				}
				var index = i;
				i = re.lastIndex;
				var idx = rule[1];
				for (var j = 0; j < idx.length; ++j)
					if (t[idx[j]]) {
						var tag = rule[2][j].apply(obj, t.slice(idx[j], idx[j + 1]));
						return new Token(tag, t[0], index, t.slice(idx[j] + 1, idx[j + 1]));
					}
			}
			function scanBySt(st) {
				var rule = scanner[st];
				do {
					var t = scanByRule(rule);
				} while (t.tag == null);
				return t;
			}
			function createStaticScan(rule) {
				return function() {
					do {
						var t = scanByRule(rule);
					} while (t.tag == null);
					return t;
				};
			}
			function scan() {
				do {
					var st = stateStack[stateStack.length - 1];
					var rule = scanner[st];
					var t = scanByRule(rule);
				} while (t.tag == null);
				return t;
			}

			var ret = {
				getPos: function(i) {
					return getPos(s, i);
				},
				reset: function() {
					i = 0;
					stateStack = [''];
				}
			};
			if (hasUnnamed) {
				ret.scan = scan;
			}
			else {
				ret.scan = scanBySt;
				for (var j in scanner)
					ret['scan' + j] = createStaticScan(scanner[j]);
			}
			return ret;
		}
	}

	var JsLexer = function() {

		var re_WhiteSpace = /[\t\x0B\x0C \xA0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000\uFEFF]/;
		var re_WhiteSpaces = RegExp(re_WhiteSpace.source + '+');

		var re_LineTerminator = /[\r\n\u2028\u2029]/;
		var re_LineTerminatorSequence = /[\n\u2028\u2029]|\r\n?/;

		var re_MultiLineComment = /\/\*(?:\/|\**[^*/])*\*+\//;
		var re_SingleLineComment = /\/\/[^\r\n\u2028\u2029]*/;
		var re_Comment = RegExp(re_MultiLineComment.source + '|' + re_SingleLineComment.source);

		var re_idStart = /[$_\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
		var re_idPart = /[$_\u0030-\u0039\u0041-\u005A\u005F\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u200C\u200D]/;

		var re_IdentifierName = RegExp("(?:"
			+ re_idStart.source
			+ "|\\\\u[\\dA-Fa-f]{4})(?:"
			+ re_idPart.source
			+ "|\\\\u[\\dA-Fa-f]{4})*");
		var re_IdentifierName_forCheck = RegExp("^" + re_idStart.source + re_idPart.source + "*$");

		var re_Punctuator = RegExp("\
{	}	(	)	[	]	\
.	;	,	<	>	<=	\
>=	==	!=	===	!==	\
+	-	*	%	++	--	\
<<	>>	>>>	&	|	^	\
!	~	&&	||	?	:	\
=	+=	-=	*=	%=	<<=	\
>>=	>>>=	&=	|=	^=	\
    ".replace(/[{}[\]().+*|^?]/g, '\\$&').match(/\S+/g).sort().reverse().join('|'));

		var re_NumericLiteral = /0[Xx][\dA-Fa-f]+|(?:(?:0|[1-9]\d*)(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/;

		var re_DoubleStringLiteral = /"(?:[^"\\\r\n\u2028\u2029]|\\(?:[^\dxu\r]|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|\r\n?|0(?!\d)))*"/;
		var re_SingleStringLiteral = /'(?:[^'\\\r\n\u2028\u2029]|\\(?:[^\dxu\r]|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|\r\n?|0(?!\d)))*'/;
		var re_StringLiteral = RegExp(re_DoubleStringLiteral.source + '|' + re_SingleStringLiteral.source);

		var re_RegularExpressionLiteral = /\/((?:[^\r\n\u2028\u2029*\\/[]|\\[^\r\n\u2028\u2029]|\[(?:[^\r\n\u2028\u2029\]\\]|\\[^\r\n\u2028\u2029])+])(?:[^\r\n\u2028\u2029\\/[]|\\[^\r\n\u2028\u2029]|\[(?:[^\r\n\u2028\u2029\]\\]|\\[^\r\n\u2028\u2029])+])*)\/(\w*)/;
		var re_DivPunctuator = /\/=?/;

		var s_Keywords_es3 = " break case catch continue default delete do else finally for function if in instanceof new return switch this throw try typeof var void while with ";
		var s_FutureReservedWords_es3 = " abstract boolean byte char class const debugger double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile ";

		var s_Keywords_es5 = s_Keywords_es3 + "debugger ";
		var s_FutureReservedWords_es5 = " class enum extends super const export import ";
		var s_FutureReservedWords_es5_strict = s_FutureReservedWords_es5 + "implements let private public yield interface package protected static ";

		function isKeyword(s) {
			return s_Keywords_es5.indexOf(' ' + s + ' ') != -1;
		}
		function isFutureReservedWord(s) {
			return s_FutureReservedWords_es5.indexOf(' ' + s + ' ') != -1;
		}


		var part_WhiteSpaces = [re_WhiteSpaces, function() {
			return 'WhiteSpaces';
		}];
		var part_LineTerminatorSequence = [re_LineTerminatorSequence, function() {
			return 'LineTerminatorSequence';
		}];
		var part_Comment = [re_Comment, function() {
			return 'Comment';
		}];
		var part_IdentifierName = [re_IdentifierName, function(a) {
			return 'IdentifierName';
		}];
		var part_Punctuator = [re_Punctuator, function(a) {
			return a;
		}];
		var part_NumericLiteral = [re_NumericLiteral, function() {
			return 'NumericLiteral';
		}];
		var part_StringLiteral = [re_StringLiteral, function() {
			return 'StringLiteral';
		}];

		var commonParts = [
			part_WhiteSpaces,
			part_LineTerminatorSequence,
			part_Comment,
			part_IdentifierName,
			part_NumericLiteral,
			part_StringLiteral,
			part_Punctuator
		];

		var Lexer = createLexer({
			Div: commonParts.concat([
				[re_DivPunctuator, function(a) {
					return a;
				}]
			]),
			RegExp: commonParts.concat([
				[re_RegularExpressionLiteral, function() {
					return 'RegularExpressionLiteral';
				}]
			])
		});

		function checkIdentifier(s) {
			return re_IdentifierName_forCheck.test(evalId(s));
		}
		function evalId(s) {
			return s.replace(/\\u([\dA-Fa-f]{4})/g, function(a, b) {
				return String.fromCharCode('0x' + b);
			});
		}

		function JSLexer(s) {
			var lex = Lexer(s);
			return {
				scan: function(div) {
					var t = div ? lex.scanDiv() : lex.scanRegExp();
					switch (t.tag) {
						case 'IdentifierName':
							var a = t.text;
							if (a.indexOf('\\') != -1)
								a = t.text = evalId(a);
							switch (a) {
								case 'null':
								case 'true':
								case 'false':
									t.tag = a;
									break;
								default:
									if (isKeyword(a))
										t.tag = a;
									else if (isFutureReservedWord(a))
										t.tag = 'FutureReservedWord';
									else {
										if (!checkIdentifier(a))
											throw Error("无效字符 " + getPos(s, t.index));
										t.tag = 'Identifier';
									}
							}
							break;
						case 'NumericLiteral':
						case 'StringLiteral':
							t.value = eval(t.text);
							break;
						case 'RegularExpressionLiteral':
							t.pattern = t.subMatches[0];
							t.flags = t.subMatches[1];
							break;
					}
					return t;
				},
				getPos: function(i) {
					return lex.getPos(i);
				},
				reset: function() {
					lex.reset();
				}
			};
		}

		return JSLexer;
	}();

	function parsejs(table, lexer, asi) {
		var tSymbols = table.tSymbols;
		var tSymbolIndex = table.tSymbolIndex;
		var tAction = table.tAction;
		var tGoto = table.tGoto;
		var tRules = table.tRules;
		var tFuncs = table.tFuncs;
		var nBegin = table.nBegin;
		var actionIndex = table.actionIndex;
		var getActLine;
		if (actionIndex) {
			getActLine = function(x) {
				return tAction[actionIndex[x]];
			};
		}
		else {
			getActLine = function(x) {
				return tAction[x];
			};
		}

		var elements = [];
		var addSemiNum = 0;

		var bNewLine = false;

		var s = 0;
		var stateStack = [0];
		var a = getToken(false);
		var offending = null;

		var isEnd = false;
		var lastA = '';
		var addSemiNum = 0;
		var valueStack = [];
		var obj = {
			get: function(i) {
				return valueStack[valueStack.length + i];
			}
		};

		while (1) {

			if (bNewLine && (/LeftHandSideExpression$/.test(lastA) ?
					a.tag == '++' || a.tag == '--' : isRestricted(lastA))) {
				var iSemi = getPrevIndex();
				if (asi) {
					offending = a;
					a = insertSemi(iSemi);
				}
				else {
					throw Error("缺少分号在 " + lexer.getPos(elements[iSemi].index));
				}
			}
			else if (!getActLine(s)[tSymbolIndex[a.tag]]
				&& (t = getActLine(s)[tSymbolIndex[';']])
				&& ((a.tag == '$' ? !isEnd && (isEnd = true)
						: bNewLine || a.tag == '}')
					&& !(beEmptyStmt(t) || inForHeader(t))
					|| isDoEnd(t)))

				if (asi) {
					offending = a;
					a = insertSemi(elements.length - 1);
				}
				else {
					throw Error("缺少分号在 " + lexer.getPos(a.index));
				}

			var t = getActLine(s)[tSymbolIndex[a.tag]];
			if (!t) {
				throw Error("Syntax error: " + lexer.getPos(a.index));
			}
			else if (isShift(t)) {
				stateStack.push(s = t);
				valueStack.push(a);
				lastA = a.tag;
				if (offending == null)
					a = getToken(getActLine(s)[tSymbolIndex['/']]);
				else {
					a = offending;
					offending = null;
				}
			}
			else if (isReduce(t)) {
				var idx = -t;
				var p = tRules[idx];
				lastA = tSymbols[p[0]];
				var num = p.length - 1;
				stateStack.length -= num;
				s = tGoto[stateStack[stateStack.length - 1]][p[0] - nBegin];
				stateStack.push(s);

				if (tFuncs[idx]) {
					var val = tFuncs[idx].apply(obj, valueStack.splice(valueStack.length - num, num));
					valueStack.push(val);
				}
				else if (num != 1) {
					valueStack.splice(valueStack.length - num, num, null);
				}
			}
			else {
				return valueStack[0];
			}
		}

		function getToken(div) {
			bNewLine = false;
			for (var t; ;) {
				elements.push(t = lexer.scan(div));
				switch (t.tag) {
					case 'LineTerminatorSequence':
						bNewLine = true;
					case 'WhiteSpaces':
					case 'Comment':
						break;
					default:
						return t;
				}
			}
		}

		function isShift(s) {
			return s > 0;
		}
		function isReduce(s) {
			return s < 0 && s > -32768;
		}
		function isAccept(s) {
			return s == -32768;
		}
		function inForHeader(s) {
			if (isShift(s))
				return isShift(getActLine(s)[tSymbolIndex[';']])
					|| isShift(getActLine(s)[tSymbolIndex[')']]);
			return false;
		}
		function beEmptyStmt(s) {
			return isShift(s) ?
				isReduce(s = getActLine(s)[0])
					 && tSymbols[tRules[-s][0]] == 'EmptyStatement'
			: isReduce(s) && tSymbols[tRules[-s][0]] == 'StatementList';
		}
		function isDoEnd(s) {
			if (isShift(s)) {
				s = getActLine(s)[0];
				return isReduce(s) && tSymbols[tRules[-s][0]] == 'IterationStatement';
			}
			return false;
		}
		function isRestricted(t) {
			switch (t) {
				case 'continue':
				case 'break':
				case 'return':
				case 'throw':
					return true;
			}
			return false;
		}
		function getPrevIndex() {
			for (var i = elements.length - 2; i >= 0; --i) {
				switch (elements[i].tag) {
					case 'WhiteSpaces':
					case 'LineTerminatorSequence':
					case 'Comment':
						continue;
				}
				return i + 1;
			}
		}

		function insertSemi(iSemi) {
			bNewLine = false;
			++addSemiNum;
			var semi = new Token(';', ';', -1);
			elements.splice(iSemi, 0, semi);
			return semi;
		}
	}
	var removeConsoleLogFromAST = function() {
		function walkAst(astRoot) {
			if (astRoot[0] != 'program')
				throw Error("isnot program");
			walkSourceElements(astRoot[1]);
		}
		function walkSourceElements(a) {
			for (var i = 0; i < a.length; ++i) {
				walkSourceElement(a[i]);
			}
		}
		function walkSourceElement(a) {
			switch (a[0]) {
				case 'block':
					walkStatements(a[1]);
					break;
				case 'var':
					walkVar(a);
					break;
				case ';':
					break;
				case 'eval':
					if (isConsoleLog(a)) {
						a.length = 1;
						a[0] = ';'
					}
					else {
						walkExpression(a[1]);
					}
					break;
				case 'if':
					walkExpression(a[1]);
					walkStatement(a[2]);
					if (a[3])
						walkStatement(a[3]);
					break;
				case 'do':
					walkStatement(a[1]);
					walkExpression(a[2]);
					break;
				case 'while':
					walkExpression(a[1]);
					walkStatement(a[2]);
					break;
				case 'for':
					if (a[1]) {
						if (a[1][0] == 'var')
							walkVar(a[1]);
						else
							walkExpression(a[1]);
					}
					if (a[2])
						walkExpression(a[2]);
					if (a[3])
						walkExpression(a[3]);
					walkStatement(a[4]);
					break;
				case 'forin':
					if (a[1][0] == 'var')
						walkVar(a[1]);
					else
						walkExpression(a[1]);
					walkExpression(a[2]);
					walkStatement(a[3]);
					break;
				case 'continue':
				case 'break':
					break;
				case 'return':
					if (a[1])
						walkExpression(a[1]);
					break;
				case 'with':
					break;
				case 'switch':
					walkExpression(a[1]);
					for (var j = 0; j < a[2].length; ++j) {
						if (a[2][j][0] == 'case') {
							walkExpression(a[2][j][1]);
							walkStatements(a[2][j][2]);
						}
						else {
							walkStatements(a[2][j][1]);
						}
					}
					break;
				case 'label':
					walkStatement(a[2]);
					break;
				case 'throw':
					walkExpression(a[1]);
					break;
				case 'try':
					walkStatements(a[1]);
					if (a[2])
						walkStatements(a[2][1]);
					if (a[3])
						walkStatements(a[3]);
					break;
				case 'debugger':
					break;
				case 'func_decl':
					walkSourceElements(a[3]);
					break;
				default:
					throw Error("unknown statement: " + a[0]);
			}
		}
		function walkStatement(a) {
			walkSourceElement(a);
		}
		function walkStatements(a) {
			walkSourceElements(a);
		}
		function walkVar(a) {
			for (var i = 0; i < a[1].length; ++i) {
				if (a[1][i][1])
					walkExpression(a[1][i][1]);
			}
		}

		function walkExpression(a) {
			switch (a[0]) {
				case 'this':
				case 'id':
				case 'null':
				case 'true':
				case 'false':
				case 'num':
				case 'string':
				case 'regexp':
					break;
				case 'array':
					for (var i = 0; i < a[1].length; ++i) {
						if (a[1][i])
							walkExpression(a[1][i]);
					}
					break;
				case 'object':
					for (var i = 0; i < a[1].length; ++i) {
						switch (a[1][i][1][0]) {
							case 'get':
								walkSourceElements(a[1][i][1][1]);
								break;
							case 'set':
								walkSourceElements(a[1][i][1][2]);
								break;
							default:
								walkExpression(a[1][i][1]);
						}
					}
					break;
				case 'func_expr':
					walkSourceElements(a[3]);
					break;
				case 'mem[]':
				case 'call[]':
					walkExpression(a[1]);
					walkExpression(a[2]);
					break;
				case 'mem.':
				case 'call.':
					walkExpression(a[1]);
					break;
				case 'memnew':
				case 'new':
				case 'call':
				case 'callcall':
					walkExpression(a[1]);
					for (var i = 0; i < a[2].length; ++i)
						walkExpression(a[2][i]);
					break;
				case 'postfix':
					walkExpression(a[1]);
					break;
				case 'unary':
					walkExpression(a[2]);
					break;
				case 'mul':
				case 'add':
				case 'shift':
				case 'rel':
				case 'equality':
					walkExpression(a[2]);
					walkExpression(a[3]);
					break;
				case 'bit_and':
				case 'bit_xor':
				case 'bit_or':
				case 'logical_and':
				case 'logical_or':
					walkExpression(a[1]);
					walkExpression(a[2]);
					break;
				case 'conditional':
					walkExpression(a[1]);
					walkExpression(a[2]);
					walkExpression(a[3]);
					break;
				case 'assign':
					walkExpression(a[2]);
					walkExpression(a[3]);
					break;
				case ',':
					walkExpression(a[1]);
					walkExpression(a[2]);
					break;
				default:
					throw Error("unknown expression: " + a[0]);
			}
		}
		function isConsoleLog(a) {
			var x = a[1];
			return x[0] == 'call' && x[1][0] == 'mem.' && x[1][1][0] == 'id' && x[1][1][1] == 'console' && x[1][2] == 'log';
		}
		return walkAst;
	}();
	function addProp(ast, name, value) {
		if (ast[1].length == 1) {
			var t = ast[1][0];
			if (t[0] == 'eval') {
				t = t[1]; //expr
				if (t[0] == 'call' && t[1][0] == 'mem.' && t[1][1][0] == 'id' && t[1][1][1] == 'KISSY' && t[1][2] == 'add'
					&& t[2].length >= 2 && t[2][1][0] == 'func_expr') {
					t = t[2][1][3];
					for (var i = 0; i < t.length; ++i) {
						if (t[i][0] == 'return') {
							var klass = t[i][1];
							var valAst = myparse('(' + JSON.stringify(value) + ');')[1][0][1];
							var arg = 't';
							t[i][1] = ['call', ['func_expr', null, [arg], [
								['eval', ['assign', '=', ['mem.', ['mem.', ['id', arg], 'prototype'], name], valAst]],
								['return', ['id', arg]]
							]], [klass]];
							break;
						}
					}
				}
			}
		}
	}
	var jsast_toString = function() {
		function quote(s) {
			return JSON.stringify(s).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
		}
		function walkAst(astRoot) {
			if (astRoot[0] != 'program')
				throw Error("isnot program");
			return walkSourceElements(astRoot[1]);
		}
		function walkSourceElements(a) {
			var s = '';
			for (var i = 0; i < a.length; ++i) {
				s += walkSourceElement(a[i]);
			}
			return s;
		}
		function walkSourceElement(a) {
			switch (a[0]) {
				case 'block':
					return '{' + walkStatements(a[1]) + '}';
				case 'var':
					return walkVar(a);
				case ';':
					return ';';
				case 'eval':
					var s = walkExpression(a[1]);
					if (/^(?:\{|function[\s(])/.test(s))
						s = '(' + s + ')';
					return s + ';';
				case 'if':
					var s = 'if(' + walkExpression(a[1]) + ')' + walkStatement(a[2]);
					if (a[3]) {
						s += 'else ' + walkStatement(a[3]);
					}
					return s;
				case 'do':
					return 'do ' + walkStatement(a[1]) + 'while(' + walkExpression(a[2]) + ');';
				case 'while':
					return 'while(' + walkExpression(a[1]) + ')' + walkStatement(a[2]);
				case 'for':
					var s = 'for(';
					if (a[1]) {
						if (a[1][0] == 'var')
							s += walkVar(a[1], true);
						else
							s += walkExpression(a[1], true) + ';';
					}
					else s += ';';
					if (a[2])
						s += walkExpression(a[2]);
					s += ';';
					if (a[3])
						s += walkExpression(a[3]);
					s += ')' + walkStatement(a[4]);
					return s;
				case 'forin':
					var s = 'for(';
					if (a[1][0] == 'var')
						s += walkVar(a[1], true).slice(0, -1);
					else
						s += exprToStr(a[1], isLHS);
					s += ' in ' + walkExpression(a[2]) + ')' + walkStatement(a[3]);
					return s;
				case 'continue':
				case 'break':
					var s = a[0];
					if (a[1]) s += ' ' + escapeId(a[1]);
					return s + ';';
				case 'return':
					var s = 'return';
					if (a[1])
						s += ' ' + walkExpression(a[1]);
					return s + ';';
				case 'with':
					return 'with(' + walkExpression(a[1]) + ')' + walkStatement(a[2]);
				case 'switch':
					var s = 'switch(' + walkExpression(a[1]) + '){';
					for (var j = 0; j < a[2].length; ++j) {
						if (a[2][j][0] == 'case') {
							s += 'case ' + walkExpression(a[2][j][1]) + ':' + walkStatements(a[2][j][2]);
						}
						else {
							s += 'default:' + walkStatements(a[2][j][1]);
						}
					}
					return s + '}';
				case 'label':
					return escapeId(a[1]) + ':' + walkStatement(a[2]);
				case 'throw':
					return 'throw ' + walkExpression(a[1]) + ';';
				case 'try':
					var s = 'try{' + walkStatements(a[1]) + '}';
					if (a[2])
						s += 'catch(' + escapeId(a[2][0]) + '){' + walkStatements(a[2][1]) + '}';
					if (a[3])
						s += 'finally{' + walkStatements(a[3]) + '}';
					return s;
				case 'debugger':
					return 'debugger;';
				case 'func_decl':
					return walkFunction(a);
				default:
					throw Error("unknown statement: " + a[0]);
			}
		}
		function walkStatement(a) {
			return walkSourceElement(a);
		}
		function walkStatements(a) {
			return walkSourceElements(a);
		}
		function walkFunction(a) {
			var s = 'function';
			if (a[1]) s += ' ' + escapeId(a[1]);
			s += '(';
			for (var i = 0; i < a[2].length; ++i) {
				if (i > 0) s += ',';
				s += escapeId(a[2][i]);
			}
			return s + '){' + walkSourceElements(a[3]) + '}';
		}
		function walkVar(a, noIn) {
			var s = 'var ';
			for (var i = 0; i < a[1].length; ++i) {
				if (i > 0) s += ',';
				s += escapeId(a[1][i][0]);
				if (a[1][i][1]) {
					s += '=' + exprToStr(a[1][i][1], isAssignment, noIn);
				}
			}
			return s + ';';
		}
		function escapeId(s) {
			return s.replace(/[^\w$]/g, function(c) {
				return '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4);
			});
		}
		function isId(s) {
			return /^[A-Za-z_$][\dA-Za-z_$]*$/.test(s) && " abstract boolean break byte case catch char class const continue debugger default delete do double else enum export extends final finally float for function goto if implements import in instanceof int interface let long native new package private protected public return short static super switch synchronized this throw throws transient try typeof var void volatile while with yield ".indexOf(' ' + s + ' ') == -1;
		}
		function escapePropertyName(s) {
			return isId(s) ? s : quote(s);
		}

		function isPrimary(t) {
			switch (t) {
				case 'this':
				case 'null':
				case 'true':
				case 'false':
				case 'id':
				case 'num':
				case 'string':
				case 'regexp':
				case 'array':
				case 'object':
				case 'func_expr':
					return true;
				default:
					return false;
			}
		}
		function isMember(t) {
			if (isPrimary(t)) return true;
			switch (t) {
				case 'mem[]':
				case 'mem.':
				case 'memnew':
					return true;
				default:
					return false;
			}
		}
		function isNew(t) {
			return isMember(t) || t == 'new';
		}
		function isCall(t) {
			switch (t) {
				case 'call':
				case 'callcall':
				case 'call[]':
				case 'call.':
					return true;
				default:
					return false;
			}
		}
		function isLHS(t) {
			return isNew(t) || isCall(t);
		}
		function isPostfix(t) {
			return isLHS(t) || t == 'postfix';
		}
		function isUnary(t) {
			return isPostfix(t) || t == 'unary';
		}
		function isMul(t) {
			return isUnary(t) || t == 'mul';
		}
		function isAdd(t) {
			return isMul(t) || t == 'add';
		}
		function isShift(t) {
			return isAdd(t) || t == 'shift';
		}
		function isRel(t) {
			return isShift(t) || t == 'rel';
		}
		function isEquality(t) {
			return isRel(t) || t == 'equality';
		}
		function isBitAnd(t) {
			return isEquality(t) || t == 'bit_and';
		}
		function isBitXor(t) {
			return isBitAnd(t) || t == 'bit_xor';
		}
		function isBitOr(t) {
			return isBitXor(t) || t == 'bit_or';
		}
		function isLogicalAnd(t) {
			return isBitOr(t) || t == 'logical_and';
		}
		function isLogicalOr(t) {
			return isLogicalAnd(t) || t == 'logical_or';
		}
		function isConditional(t) {
			return isLogicalOr(t) || t == 'conditional';
		}
		function isAssignment(t) {
			return isConditional(t) || t == 'assign';
		}

		function exprToStr(x, typeCheck, noIn) {
			var s = walkExpression(x, noIn);
			return typeCheck && !typeCheck(x[0]) ? '(' + s + ')' : s;
		}
		function walkExpression(a, noIn) {
			var s;
			switch (a[0]) {
				case 'this':
				case 'null':
				case 'true':
				case 'false':
					s = a[0];
					break;
				case 'id':
					s = escapeId(a[1]);
					break;
				case 'num':
					s = String(a[1]);
					break;
				case 'string':
					s = quote(a[1]);
					break;
				case 'regexp':
					s = '/' + a[1] + '/' + a[2];
					break;
				case 'array':
					s = '[';
					for (var i = 0; i < a[1].length; ++i) {
						if (i > 0) s += ',';
						if (a[1][i])
							s += exprToStr(a[1][i], isAssignment);
					}
					if (i > 0 && !a[1][i - 1])
						s += ',';
					s += ']';
					break;
				case 'object':
					s = '{';
					for (var i = 0; i < a[1].length; ++i) {
						if (i > 0) s += ',';
						var name = escapePropertyName(a[1][i][0]);
						switch (a[1][i][1][0]) {
							case 'get':
								s += 'get ' + name + '(){' + walkSourceElements(a[1][i][1][1]) + '}';
								break;
							case 'set':
								s += 'set ' + name + '(' + escapeId(a[1][i][1][1]) + '){' + walkSourceElements(a[1][i][1][2]) + '}';
								break;
							default:
								s += name + ':' + exprToStr(a[1][i][1], isAssignment);
						}
					}
					s += '}';
					break;
				case 'func_expr':
					s = walkFunction(a);
					break;
				case 'mem[]':
					s = exprToStr(a[1], isMember);
					if (a[2][0] == 'string' && isId(a[2][1])) {
						s += '.' + a[2][1];
					}
					else {
						s += '[' + walkExpression(a[2]) + ']';
					}
					break;
				case 'mem.':
					s = exprToStr(a[1], isMember);
					if (isId(a[2])) {
						if (/\d$/.test(s)) s += ' ';
						s += '.' + escapeId(a[2]);
					}
					else s += '[' + quote(a[2]) + ']';
					break;
				case 'memnew':
					s = 'new ' + exprToStr(a[1], isMember) + '(';
					for (var i = 0; i < a[2].length; ++i) {
						if (i > 0) s += ',';
						s += exprToStr(a[2][i], isAssignment);
					}
					s += ')';
					break;
				case 'new':
					s = 'new ' + exprToStr(a[1], isNew);
					break;
				case 'call':
					s = exprToStr(a[1], isMember) + '(';
					for (var i = 0; i < a[2].length; ++i) {
						if (i > 0) s += ',';
						s += exprToStr(a[2][i], isAssignment);
					}
					s += ')';
					break;
				case 'callcall':
					s = exprToStr(a[1], isCall) + '(';
					for (var i = 0; i < a[2].length; ++i) {
						if (i > 0) s += ',';
						s += exprToStr(a[2][i], isAssignment);
					}
					s += ')';
					break;
				case 'call[]':
					s = exprToStr(a[1], isCall);
					if (a[2][0] == 'string' && isId(a[2][1])) {
						s += '.' + a[2][1];
					}
					else {
						s += '[' + walkExpression(a[2]) + ']';
					}
					break;
				case 'call.':
					s = exprToStr(a[1], isCall);
					if (isId(a[2])) {
						if (/\d$/.test(s)) s += ' ';
						s += '.' + escapeId(a[2]);
					}
					else s += '[' + quote(a[2]) + ']';
					break;
				case 'postfix':
					s = exprToStr(a[1], isLHS) + a[2];
					break;
				case 'unary':
					s = a[1] + ' ' + exprToStr(a[2], isUnary);
					break;
				case 'mul':
					s = exprToStr(a[2], isMul);
					s += a[1] == '/' ? '/ ' : a[1];
					s += exprToStr(a[3], isUnary);
					break;
				case 'add':
					s = exprToStr(a[2], isAdd);
					s += a[1] + ' ';
					s += exprToStr(a[3], isMul);
					break;
				case 'shift':
					s = exprToStr(a[2], isShift) + a[1] + exprToStr(a[3], isAdd);
					break;
				case 'rel':
					s = exprToStr(a[2], isRel, a[1] != 'in' && noIn);
					s += /^in/.test(a[1]) ? ' ' + a[1] + ' ' : a[1];
					s += exprToStr(a[3], isShift);
					if (noIn && a[1] == 'in') s = '(' + s + ')';
					break;
				case 'equality':
					s = exprToStr(a[2], isEquality, noIn) + a[1] + exprToStr(a[3], isRel, noIn);
					break;
				case 'bit_and':
					s = exprToStr(a[1], isBitAnd, noIn) + '&' + exprToStr(a[2], isEquality, noIn);
					break;
				case 'bit_xor':
					s = exprToStr(a[1], isBitXor, noIn) + '^' + exprToStr(a[2], isBitAnd, noIn);
					break;
				case 'bit_or':
					s = exprToStr(a[1], isBitOr, noIn) + '|' + exprToStr(a[2], isBitXor, noIn);
					break;
				case 'logical_and':
					s = exprToStr(a[1], isLogicalAnd, noIn) + '&&' + exprToStr(a[2], isBitOr, noIn);
					break;
				case 'logical_or':
					s = exprToStr(a[1], isLogicalOr, noIn) + '||' + exprToStr(a[2], isLogicalAnd, noIn);
					break;
				case 'conditional':
					s = exprToStr(a[1], isLogicalOr, noIn) + '?' + exprToStr(a[2], isAssignment, noIn) + ':' + exprToStr(a[3], isAssignment, noIn);
					break;
				case 'assign':
					s = exprToStr(a[2], isLHS) + a[1] + exprToStr(a[3], isAssignment, noIn);
					break;
				case ',':
					s = exprToStr(a[1], null, noIn) + ',' + exprToStr(a[2], null, noIn);
					break;
				default:
					throw Error("unknown expression: " + a[0]);
			}
			return s;
		}
		return walkAst;
	}();

	function myparse(s, asi) {
		var lex = JsLexer(s);
		var ast = parsejs(jstable, lex, asi);
		return ast;
	}
	function Proc(jscode, asi) {
		/// <param name="jscode" type="String">JS 代码</param>
		/// <param name="asi" type="Boolean" optional="true">是否自动插入分号</param>
		if (asi == null) asi = true;
		this.ast = myparse(jscode, asi);
	}
	Proc.prototype.removeConsoleLog = function() {
		removeConsoleLogFromAST(this.ast);
		return this;
	};
	Proc.prototype.addProp = function(name, value) {
		addProp(this.ast, name, value);
		return this;
	};
	Proc.prototype.getCode = function() {
		return jsast_toString(this.ast);
	};
	return Proc;
	
}();
module.exports=JsProc;
