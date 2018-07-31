const fs = require('fs');
const path = require('path');
var Excel = require('exceljs');

var inboundWorkbook = new Excel.Workbook();
const root_i18n =  process.argv[2];
const fileName = process.argv[3];
inboundWorkbook.xlsx.readFile(fileName).then(function () {
  var inboundWorksheet = inboundWorkbook.getWorksheet(1); //or name of the worksheet
  let preFileName = undefined;
  let currentFileName = undefined;
  inboundWorksheet.eachRow(function (row, rowNumber) {
    if(rowNumber!==1){
      currentFileName = root_i18n + '/workbench/pc/' + row.values[1].replace('.cn.i18n','.en.i18n');
      //判断文件是否存在
      if(fs.existsSync(currentFileName) && currentFileName !== preFileName){
        //存在，并且不是由该node创建的
        fs.unlinkSync(currentFileName);
        preFileName = currentFileName ;
        inputFunc(currentFileName,row.values[3],row.values[7]);
      }else{
        inputFunc(currentFileName,row.values[3],row.values[7]);
      }
    }
  });
});

var inputFunc = function (currentFileName, key, value='noDictionnaryFlag') {
   //写入变量
   let obj = {}
   obj.key = key
   obj.value = value
   let input = JSON.stringify(obj)
   fs.appendFileSync(currentFileName, input + '\n');
};