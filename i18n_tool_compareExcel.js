const fs = require('fs');
const path = require('path');
var Excel = require('exceljs');

const translateFile =  process.argv[2];
const newFile = process.argv[3];

//定义一个新的表格
const workbook = new Excel.Workbook();
var ws1 = workbook.addWorksheet('compare.xlsx');

//翻译好的文件和最新生成的文件
var newFileWorkBook = new Excel.Workbook();
var translateFileWorkBook = new Excel.Workbook();
var translateFileSheet;
var newFileSheet

translateFileWorkBook.xlsx.readFile(translateFile).then(()=>{
    translateFileSheet = translateFileWorkBook.getWorksheet(1);
    if(translateFileSheet) nextFunc()  ;
})

var nextFunc = function () {
  newFileWorkBook.xlsx.readFile(newFile).then((res) => {
      newFileSheet = newFileWorkBook.getWorksheet(1); //or name of the worksheet
      if(newFileSheet ){
        getTranslate(newFileSheet,translateFileSheet);
        writeFunc();
      }
  });
}
var match = false;
var getTranslate = function (newFileSheet,translateFileSheet) {
  if(!newFileSheet || !translateFileSheet) return false;
  newFileSheet.eachRow(function (row, rowNumber) {
    translateFileSheet.eachRow((translateRow, num) =>{
        if(translateRow.values[1] === row.values[1]  && translateRow.values[6] === row.values[6] && !match){
            match = true
            ws1.addRow([row.values[1], row.values[2], row.values[3],row.values[4], row.values[5], row.values[6], translateRow.values[7], '']);
        }else if(!match && num === translateFileSheet.actualRowCount){
          ws1.addRow([row.values[1], row.values[2], row.values[3],row.values[4], row.values[5], row.values[6], row.values[7], '']);
        }
    });
    //新的一轮默认为false
    match  = false;
  });
  
}
var writeFunc = function () {
  workbook.xlsx.writeFile(`compare.xlsx`)
  .then(function () {
    console.log(`生成compare.xlsx`);
  });
}




