module.exports = createLexer;
function createLexer(g) {
	function Position(row, col) {
		this.row = row;
		this.col = col;
	}
	Position.prototype = {
		toString: function() {
			return '(' + this.row + ',' + this.col + ')';
		}
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

	function Token(tag, text, index, subMatches) {
		this.tag = tag;
		this.text = text;
		this.index = index;
		this.subMatches = subMatches;
	}
	Token.prototype.toString = function() {
		return this.text;
	};
	function inArr(a, t) {
		for (var i = 0; i < a.length; ++i)
			if (a[i] == t)
				return i;
		return -1;
	}

	function buildScanner(a) {
		var n = 1;
		var b = [];
		var empty = 0;
		var matchIndexes = [1];
		var fa = [];
		for (var i = 0; i < a.length; ++i) {
			matchIndexes.push(n += a[i][1].length);
			fa.push(a[i][1]);
			b.push('(' + a[i][0].source + ')');
			if (a[i][0].test(''))
				++empty;
		}

		if (empty > 0) {
			throw Error('有 ' + empty + ' 个正则匹配空串');
		}
		var re = RegExp(b.join('|') + '|', 'g');
		//alert(matchIndexes);
		return [re, matchIndexes, fa];
	}


	var endTag = g.$ || '$';
	var ignore = g.$ignore || [];
	function isIgnore(t) {
		return inArr(ignore, t) != -1;
	}
	var scanner = {};
	for (var i in g) {
		switch (i) {
			case '$':
			case '$ignore':
				continue;
		}
		scanner[i] = buildScanner(g[i]);
	}

	return Lexer;
	function Lexer(s) {
		if (typeof s != 'string')
			s = String(s);
		var Length = s.length;
		var i = 0;
		var stateStack = [''];

		var obj = {
			text: '',
			index: 0,
			pushState: function(s) {
				stateStack.push(s);
			},
			popState: function() {
				stateStack.pop();
			},
			retract: function(n) {
				i -= n;
			}
		};

		function scan() {
			var st = stateStack[stateStack.length - 1];
			var rule = scanner[st];
			var re = rule[0];
			re.lastIndex = i;
			var t = re.exec(s);
			if (t[0] == '') {
				if (i < Length) {
					throw Error('lexer error: ' + getPos(s, i) +
						'\n' + s.slice(i, i + 50));
				}
				return new Token(endTag, '', i);
			}
			obj.index = i;
			i = re.lastIndex;
			var idx = rule[1];
			for (var j = 0; j < idx.length; ++j)
				if (t[idx[j]]) {
					var tag = rule[2][j].apply(obj, t.slice(idx[j], idx[j + 1]));
					return new Token(tag, t[0], obj.index, t.slice(idx[j] + 1, idx[j + 1]));
				}
		}

		return {
			scan: function() {
				var t;
				do {
					t = scan();
				} while (isIgnore(t.tag));
				return t;
			},
			getPos: function(i) {
				return getPos(s, i);
			}
		};
	}
}
