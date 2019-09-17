
## 1原理
多语言标记为$i18n{...}$i18n-end

"..."就是找到的中文

## 2. 步骤
### 2.1 运行 node i18n_tool.addTags.js [dir]
自动在中文前后添加标签`$i18n` 和 `$i18n-end`

解析：
1、dir
dir为要扫描的资源根目录,要求为绝对路径：
win系统格式为c:\\Users\\liutom\\frontwalker\\walker\\test,
linux系统格式为/Users/liutom/frontwalker/walker/test

2、产出i18n_addTags目录
生成i18n_addTags目录，将源码改成`$i18n{中文}$18n_end`

### 2.2 运行 node i18n_tool.1.js  [i18n_addTags_dir]
提取中文，并用key来替代，生.cn.i18n文件，内容就是一个对象

```javascript
{key1:value1,key2:value2...}
```
`$i18n{中文}$18n_end` 改成 `$i18n{key1}$18n_end`

解析：
1、i18n_addTags_dir
2.1生成的目录

2、产出i18n目录
运行后会在dir上级目录新建i18n目录,

3、产出.cn.i18n文件 
存放生成的多语言文件,其中以.cn.i18n结尾的文件为所要翻译的中文文件
文件内容为
{"key":"second.js0","value":"我的第一段"}
其中value为所需要翻译的语言
翻译人员需要在相同目录下新建多余文件,如英文,以.en.i18n结尾,内容只改变value值
将"我的第一段"翻译为"my first paragraph"
{"key":"second.js0","value":"my first paragraph"}

###2.3 运行 node i18n_tool.2.js [i18n_dir]

注意：在执行这步之前确认已经添加好.en.i18n,.tw.i18n文件
解析
1、i18n_dir
i18n目录绝对路径,然后会在i18n_dir上级目录新建不同语种目录，如en/ tw/


> 以上是全部的流程
> 下面是辅助翻译

## 3 辅助翻译

### 3.1 i18n_tool_exportExcel.js
根据.cn(en/tw).i18n文件生成一个excel
执行命令： 
```node
node i18n_tool.exportExcel.js i18n_dir excelName lan
```
参数1:i18n_dir 同上，
参数2:但是需要添加一个excel的名字，不然默认default
参数3:导出不同语言的文件，默认导出所有的.cn.i18n文件，
lan = cn，导出所有.cn.i18n到一个excel中，
lan = en，导出所有.en.i18n到一个excel中，
lan = tw，导出所有.tw.i18n到一个excel中等


### 3.2  i18n_tool_importExcel.js
执行命令： 
```node
node i18n_tool_importExcel.js i18n_dir excelTranslateName
```
上一步的反向操作，根据一个excel生成对应的.cn(en/tw).i18n文件

参数1:i18n_dir同上
参数2:excelTranslateName: 翻译完的excel文件，目前默认值生成.en.i18n 文件



### 3.2  i18n_tool_compareExcel.js
执行命令： 
```node
node i18n_tool_compareExcel.js translateFile(专业人员翻译好的) newFile 

```
translateFile文件是覆盖newFile文件，所以前者多是最新翻译完成的文件，后者是最新提取出来的文件
