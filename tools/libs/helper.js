//工具函数集合

(function(){
    var fn={};
    var Fs=require('fs');
    var Path=require("path");
    var SEP=Path.sep;


    var getFileList=function(root,childFileName){
        var res = [],f=[],files;
        files = Fs.readdirSync(root);
        files.forEach(function(file){
            var pathname = root+SEP+file,stat = Fs.lstatSync(pathname);
            if (!stat.isDirectory()){
                if(childFileName){
                    if(pathname.indexOf(childFileName)!=-1)res.push(pathname);
                }else{
                    res.push(pathname);
                }

            } else {
                res = res.concat(getFileList(pathname,childFileName));
            }

        });
        return res;
    };

    /**
     * 获取文件夹下文件列表
     * @param  {String} root          root
     * @param  {String} childFileName 子文件夹名
     * @return {Arr}               返回文件列表
     */

    fn.getAllFiles=function(root,childFileName){
          var f;
          f=getFileList(root,childFileName);
          return f;
    };

    /**
     * 获取指定类型文件夹名称
     * @param  {[type]} fileList [description]
     * @param  {[type]} type     example：“。js”
     * @return {[type]}          [description]
     */
    fn.getTypedFiles=function(fileList,type){
        var typedFileList=[];
        fileList.forEach(function(f,i){
            if(Path.extname(f)==type){
                typedFileList.push(f);
            }
        });
        return typedFileList;
    };

    /**
     * 获得一级文件夹列表
     * @param  {[type]} root [description]
     * @return {[type]}      [description]
     */
    fn.getFirstLevelFile=function(root){
        var files=Fs.readdirSync(root);
        var fileArr=[];
        files.forEach(function(f,i){
            var pathname=root+SEP+ f,stat=Fs.lstatSync(pathname);
            if(stat.isDirectory()){
                fileArr.push(pathname);
            }
        });
        return fileArr;
    };



    //去掉数组中重复的元素
    fn.uniqArr=function(arr){
        var toObj=function(arr){
            var o={},l=arr.length,i;
            for(i=0;i<l;i++){
                o[arr[i]]=true;
            }
            return o;
        };
        var keys=function(o){
            var i,uarr=[];
            for(i in o){
                if(o.hasOwnProperty(i)){
                    uarr.push(i);
                }
            }
            return uarr;
        };
        return keys(toObj(arr));
    };

    //去掉数组中元素
    fn.delArrEl=function(arr,n) {
        if(n<0) {
            return arr;
        }
        else {
            return arr.slice(0,n).concat(arr.slice(n+1,arr.length));
        }

    };

    //将某个文件放在数组的最前面
    fn.resortFileToFirst=function(arr,TofirstFile){
        var tmpElm;
        //var tmpArr=[];
        for(var i=0;i<arr.length;i++){
            if(arr[i].indexOf(TofirstFile)!=-1){
                tmpElm=arr[i];
                //arr=fn.delArrEl(arr,i);
                arr.splice(i,1);
                break;
            }
        }
        if(tmpElm){
            arr.unshift(tmpElm);
        }
        return arr;
    };

    //添加后缀名称 例如：components/tips/index 变成 componnets/tips/index.js or css
    fn.addPathPrefix=function(pre,arr,prefix){
         var newArr=[];
         for(var i=0;i<arr.length;i++){
             newArr.push(pre+SEP+arr[i]+".css");
         }
        return newArr;
    };

    fn.filterFile=function(arr,filterName){
        var newArr=[];
        for(var i=0;i<arr.length;i++){
            if(arr[i].indexOf(filterName)==-1){
                newArr.push(arr[i]);
            }
        }
        return newArr;
    };




    module.exports=fn;
})();


