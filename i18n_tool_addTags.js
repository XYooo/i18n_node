/**
 * Created by liuqnh on 2017/12/21.
 */


const fs = require('fs');
const path = require('path');
const lineReader = require('readline');

var walk = function (dir, dir_i18n, done) {
  let results = [];
  const root = dir;
  const root_i18n = dir_i18n;

  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => { // 来验证是否有这个文件
        if (stat && stat.isDirectory()) { // 文件的嵌套
          var half = file.substring(root.length, file.length);
          if (!fs.existsSync(root_i18n + half)) {
            fs.mkdirSync(root_i18n + half);
          }
          walk(file, root_i18n + half , (err, res) => {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
        } else { //这是单个文件
          results.push(file);
          var half = file.substring(root.length, file.length);
          // 20180531新增判断如果不是js文件，则不用解析了
          if(file.match(/.jpg|.gif|.png|.bmp|.svg|.css|.woff/i)){
            //fs.copyFileSync(file,root_i18n+half);
            fs.writeFileSync(root_i18n+half, fs.readFileSync(file)); 
          }else{
            let readLine = lineReader.createInterface({
              input: fs.createReadStream(file),
            });// 先创建一个实例
            let count = 0;
            readLine.on('line', (line) => {
                var spieces=line;// 拿到所有字符串
                var re= /[\u4E00-\u9FA5]+([\u4E00-\u9FA5]|[\uFE30-\uFFA0]|[0-9]|[\?\,\。\.\、])+/g; 
                var regNote =/(^.*\/\/|^\s*\/\*.*\*\/$)/g; // 存在的问题：中文展示后面有注释
                var replaced=''
                var matchNote = spieces.match(regNote);
                // 添加一个判断 是否是注释
                if(matchNote){
                  replaced=replaced+spieces;
                }else{
                  var match=spieces.match(re);//取到中文
                  // 20180605 新增判断，如果一行代码多处匹配
                  if(match){ // 由此可见值校验前半段
                      if(match.length > 1){
                        // 一行逐一替换
                        var subMatch;
                        replaced = spieces;
                        match.map((item)=>{
                            subMatch = '$i18n{' +item+'}$i18n-end' ;
                            replaced = replaced.replace(item, subMatch);
                        })
                      }else{ //只有一处匹配那么全局替换就可以
                        var replacement = '$i18n{' + match +'}$i18n-end' ;
                        replaced=replaced+spieces.replace(re,replacement)
                      }
                  }else{
                      replaced=replaced+spieces;
                  }
                }
                fs.appendFileSync(root_i18n+half, replaced+'\n');
            });
          }
          
        }
        if (!--pending) done(null, results);
      });
    });
  });
};


const indir = process.argv[2]; // /Users/yaoxin/Downloads/workspace/cloud-os_manager_fe/src
const rootpaths = indir.split(/\/|\\/);// [,Users,yaoxin,Downloads,workspace,cloud-os_manager_fe,src]
const root_i18n = `${indir.substring(0, indir.length - rootpaths[rootpaths.length - 1].length)}i18n_addTags`; // /Users/yaoxin/Downloads/workspace/cloud-os_manager_fe/i18n
if (!fs.existsSync(root_i18n)) { fs.mkdirSync(root_i18n); }
walk(indir, root_i18n, (err, results) => {
  if (err) throw err;
});

