/**
 * 测试 中文转unicode的方法
 */
var Converter=require('./unicode');
var str="中国呀呀hello";
var result=Converter.chineseToUnicode(str);
console.log('result',result);


/**
 * 测试去console方法
 */
var jsProc=require('./jsproc');
var testStr="console.log('hlll');alert('11')";
var xx=new jsProc(testStr);
var aa=xx.removeConsoleLog().getCode();
// console.log(xx);
// console.log(jsProc);
console.log(aa);
/**
 * 测试模板作为view属性
 */
var Fs=require('fs');
var content=Fs.readFileSync('./remind.js','utf8');

var bb=new jsProc(content);
var cc=bb.addProp("template", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx").getCode();
Fs.writeFileSync('./remindNew.js',cc,'utf8');
/**
 * 测试
 */



