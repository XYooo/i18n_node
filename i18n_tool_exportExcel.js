/**
 * Created by liuqnh on 2017/12/21.
 */


const fs = require('fs');
const path = require('path');
const lineReader = require('readline');
var Excel = require('exceljs');

var walk = function (dir, dir_i18n, lan, done) {
  let results = [];
  const root = dir;
  const root_i18n = dir_i18n;
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          var half = file.substring(root.length, file.length);
          if (!fs.existsSync(root_i18n + half)) {
            fs.mkdirSync(root_i18n + half);
          }
          walk(file, root_i18n + half, lan, function (err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {

          var tails = file.split('.')
          //只修改i18n
          if (tails[tails.length - 1] == 'i18n') {
            results.push(file);
            var half = file.substring(root.length, file.length);
            // 不是中文的文件
            if (half.indexOf(`.${lan}.i18n`) < 0) {
              return false;
            } else {
              const content = fs.readFileSync(file).toString().split('\n');
              let fileSplit = file.split('/');
              let fileFDic = file.split('pc/')[1];
              if (!fs.existsSync(file) || content.length === 0 || content[0] === '') {
                //没有这个文件不需要读取
                return false;
              }
              for (let i = 0; i < content.length; i++) {
                if (content[i] === '') continue;//空行
                const obj = JSON.parse(content[i]);
                //写入xlsx
                ws1.addRow([fileFDic, fileSplit[fileSplit.length - 1], obj["key"], projectName, '', obj["value"], '', '']);
              }
            }
          }

        }
        if (!--pending) done(null, results);
      });
    });

  });
  
};

var lansRecursive = function (path, lans) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        lans = lansRecursive(curPath, lans);
      } else {
        const tails = curPath.split('.');
        if (tails[tails.length - 1] == 'i18n' && lans.indexOf(tails[tails.length - 2]) == -1) {
          lans = lans.concat(tails[tails.length - 2]);
        }
      }
    });
  }
  return lans;
};



const workbook = new Excel.Workbook();
const indir = process.argv[2];
const excelName = process.argv[3] || 'default';
const lan = process.argv[4] || 'cn';
//add header
let ws1 = workbook.addWorksheet(excelName);
ws1.addRow(['文件目录', '文件名', 'key', '应用名称', '模块与功能结点', '简体中文', '英文', '繁体中文']);
const projectName = indir.split('/')[indir.split('/').length - 2];
const rootpaths = indir.split(/\/|\\/);
const root_i18n = indir;
if (!fs.existsSync(root_i18n)) { fs.mkdirSync(root_i18n); }
const root_lan = indir.substring(0, indir.length - rootpaths[rootpaths.length - 1].length) + 'cn';
if (!fs.existsSync(root_lan)) { fs.mkdirSync(root_lan); }
walk(indir, root_lan, lan, (err, results) => {
  if (err) throw err;
});
setTimeout(() => {
  workbook.xlsx.writeFile(`${excelName}.xlsx`)
    .then(function () {
      console.log(`生成${excelName}.xlsx`);
    });
}, 2000);