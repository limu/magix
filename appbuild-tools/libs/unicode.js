/**
 * 中文转化为unicode
 */
(function() {
	var Converter = {};
	Converter.chineseToUnicode = function(str) {
		var regChinese = /[\u4e00-\u9fa5]/g;
		var rst = str.replace(regChinese, function(a, b, c) {
			return escape(a).replace('%', '\\');
		});
		return rst;
	}
	module.exports=Converter;
})()