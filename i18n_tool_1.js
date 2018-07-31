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
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {


          var half = file.substring(root.length, file.length);

          if (!fs.existsSync(root_i18n + half)) {
            fs.mkdirSync(root_i18n + half);

          }

          walk(file, root_i18n + half, function (err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {

          results.push(file);
          var readLine = lineReader.createInterface({
            input: fs.createReadStream(file)
          });
          var count = 0

          var half = file.substring(root.length, file.length);
          if (fs.existsSync(root_i18n + half + '.cn.i18n')) {
            fs.truncateSync(root_i18n + half + '.cn.i18n')
          }
          if (fs.existsSync(root_i18n + half)) {
            fs.truncateSync(root_i18n + half)
          }
          // 20180531 添加图片不处理
          if(file.match(/.jpg|.gif|.png|.bmp|.svg|.css|.woff/i)){
            fs.writeFileSync(root_i18n + half, fs.readFileSync(file)); 
          }else {
            readLine.on('line', function (line) {
              var spieces = line.split(/\$i18n-end/)
              var re = /\$i18n{.+}/g
              var replaced = ''
              for (i = 0; i < spieces.length; i++) {
  
                var match = spieces[i].match(re)
                if (match) {
                  var key = file.substring(dir.length + 1) + (count++)
                  var value = match[0].substring(6, match[0].length - 1)
                  var obj = {}
                  obj.key = key
                  obj.value = value
                  var input = JSON.stringify(obj)
                  var replacement = '$i18n{' + key + '}$i18n-end'
                  replaced = replaced + spieces[i].replace(re, replacement)
  
  
                  fs.appendFileSync(root_i18n + half + '.cn.i18n', input + '\n');
  
                } else {
                  replaced = replaced + spieces[i]
                }
  
              }
  
              fs.appendFileSync(root_i18n + half, replaced + '\n');
  
            })
          }
        }

        if (!--pending) done(null, results);

      });
    });
  });
};


const indir = process.argv[2]; // /Users/yaoxin/Downloads/workspace/cloud-os_manager_fe/src
const rootpaths = indir.split(/\/|\\/);// [,Users,yaoxin,Downloads,workspace,cloud-os_manager_fe,src]
const root_i18n = `${indir.substring(0, indir.length - rootpaths[rootpaths.length - 1].length)}i18n`; // /Users/yaoxin/Downloads/workspace/cloud-os_manager_fe/i18n
if (!fs.existsSync(root_i18n)) { fs.mkdirSync(root_i18n); }
walk(indir, root_i18n, (err, results) => {
  if (err) throw err;
});

