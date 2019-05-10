/*!***********************************************
 Copyright (c) 2016, Neusoft Inc.
 All rights reserved
 图表秀 Version 1.0.0 2019.3.18
 ************************************************/
angular.module("dataviz.chartedit.customProperties",[]).factory("customTips",["$translate",function(a){return{getTips:function(t,e,n){var r=n.simpleJson,i=r.data,s=r.option.properties.series.items.anyOf[0].properties.type["default"],o={};for(var c in i.properties)"time"!=c&&(o[c]=i.properties[c]);if(""===e["default"]){var d="";if("sunburst"===s){if(0!==o.legend.bind.length){var b=a.instant("chartedit.LEVEL");d=d+a.instant("chartedit.option.NAME",{name:b})+"\n"}var u=o.value.bind[0];return d=d+u.fieldName+"： <"+u.fieldName+">"}if("bar"===s||"line"===s){var p=_.filter(o,function(a){return a.hasOwnProperty("colorType")?void 0:!0});0!==p[0].bind.length&&(d=d+p[0].bind[0].fieldName+": <"+p[0].bind[0].name+">");var l="";0!==o.legend.bind.length&&(l="<"+o.legend.bind[0].name+">-");var f=o.value.bind;return o.valueBar&&0!=o.valueBar.bind.length&&(f=f.concat(o.valueBar.bind)),_.each(f,function(a){d=d+"\n"+l+a.fieldName+": <"+a.fieldName+">"}),"88"==n.compId&&(d+="\n累计:<Total>"),d}if("candlestick"===s){for(var m=0;m<i["default"][0].length;m++){var M=i["default"][0][m].lastIndexOf("（");if(-1===M)d=d+i["default"][0][m]+": <"+i["default"][0][m]+">\n"+a.instant("chartedit.option.DAYK")+"\n";else{var h=i["default"][0][m].substring(0,M);d=d+h+": <"+i["default"][0][m]+">\n"}}return d+="MA5: <MA5>\nMA10: <MA10>\nMA20: <MA20>\nMA30: <MA30>\n",d.substring(0,d.length-1)}if("graph"===s){d=d+o.source.bind[0].name+": <"+o.source.bind[0].name+">\n";var u=o.value.bind[0];return d=d+u.fieldName+"： <"+u.fieldName+">"}for(c in i["default"][0]){var M=i["default"][0][c].lastIndexOf("（");if(-1===M)d=d+i["default"][0][c]+": <"+i["default"][0][c]+">\n";else{var h=i["default"][0][c].substring(0,M);d=d+h+": <"+i["default"][0][c]+">\n"}}return _.each(o,function(a){_.each(a.bind,function(a){a.hasOwnProperty("hierarchy")&&(d=d.replace(a.name+": <"+a.name+">",a.fieldName+": <"+a.name+">"))})}),"pie"!==s&&"pinterest"!==s&&"chord"!==s||(d=d+a.instant("chartedit.option.PERCENTAGESHARE")+"\n"),d.substring(0,d.length-1)}return e["default"]}}}]).factory("customLabels",["$translate",function(a){function t(a,t){for(var e=new Array(a.length),n=0;n<e.length;n++)for(var r in t)for(var i=!1,s=0;s<t[r].bind.length;s++){if(t[r].bind[s].fieldName===a[n]){e[n]=t[r].name,i=!0;break}if(i)return}return e}return{getLabels:function(a){var e=t(a.userData[0],a.simpleJson.data.properties),n={};switch(n.bindHintMap={},n.bindHintMapContray={},a.compId){case"7":case"41":case"42":case"411":_.each(e,function(t,e){switch(t){case"图例":n.bindHintMap["{"+a.userData[0][e]+"}"]="{b}",n.bindHintMapContray["{b}"]="{"+a.userData[0][e]+"}";break;case"数据值":n.bindHintMap["{"+a.userData[0][e]+"}"]="{c}",n.bindHintMapContray["{c}"]="{"+a.userData[0][e]+"}"}}),n.bindHintMap["{百分比}"]="{d}",n.bindHintMapContray["{d}"]="{百分比}";break;case"54":case"993":_.each(e,function(t,e){switch(t){case"省份维度":n.bindHintMap["{"+a.userData[0][e]+"}"]="{b}",n.bindHintMapContray["{b}"]="{"+a.userData[0][e]+"}";break;case"大小调整依据":n.bindHintMap["{"+a.userData[0][e]+"}"]="{c}",n.bindHintMapContray["{c}"]="{"+a.userData[0][e]+"}"}});break;case"56":_.each(e,function(t,e){switch(t){case"配色依据":n.bindHintMap["{"+a.userData[0][e]+"}"]="{a}",n.bindHintMapContray["{a}"]="{"+a.userData[0][e]+"}";break;case"国家名称":n.bindHintMap["{"+a.userData[0][e]+"}"]="{b}",n.bindHintMapContray["{b}"]="{"+a.userData[0][e]+"}";break;case"大小调整依据":n.bindHintMap["{"+a.userData[0][e]+"}"]="{c}",n.bindHintMapContray["{c}"]="{"+a.userData[0][e]+"}"}});break;case"55":_.each(e,function(t,e){switch(t){case"省份维度":n.bindHintMap["{"+a.userData[0][e]+"}"]="{b}",n.bindHintMapContray["{b}"]="{"+a.userData[0][e]+"}";break;case"明暗调整依据":n.bindHintMap["{"+a.userData[0][e]+"}"]="{c}",n.bindHintMapContray["{c}"]="{"+a.userData[0][e]+"}"}});break;case"0":_.each(e,function(t,e){switch(t){case"分类轴":n.bindHintMap["{"+a.userData[0][e]+"}"]="{b}",n.bindHintMapContray["{b}"]="{"+a.userData[0][e]+"}";break;case"图例":n.bindHintMap["{"+a.userData[0][e]+"}"]="{a}",n.bindHintMapContray["{a}"]="{"+a.userData[0][e]+"}";break;case"数据值":n.bindHintMap["{"+a.userData[0][e]+"}"]="{c}",n.bindHintMapContray["{c}"]="{"+a.userData[0][e]+"}"}});break;case"33":_.each(e,function(t,e){switch(t){case"图例":n.bindHintMap["{"+a.userData[0][e]+"}"]="{b}",n.bindHintMapContray["{b}"]="{"+a.userData[0][e]+"}";break;case"数据值":n.bindHintMap["{"+a.userData[0][e]+"}"]="{c}",n.bindHintMapContray["{c}"]="{"+a.userData[0][e]+"}"}});break;case"57":_.each(e,function(t,e){switch(t){case"半径轴":n.bindHintMap["{"+a.userData[0][e]+"}"]="{b}",n.bindHintMapContray["{b}"]="{"+a.userData[0][e]+"}";break;case"大小调整依据":n.bindHintMap["{"+a.userData[0][e]+"}"]="{c}",n.bindHintMapContray["{c}"]="{"+a.userData[0][e]+"}"}});break;case"34":_.each(e,function(t,e){switch(t){case"目的维度":n.bindHintMap["{"+a.userData[0][e]+"}"]="{b}",n.bindHintMapContray["{b}"]="{"+a.userData[0][e]+"}";break;case"指标":n.bindHintMap["{"+a.userData[0][e]+"}"]="{c}",n.bindHintMapContray["{c}"]="{"+a.userData[0][e]+"}"}});break;case"25":n.bindHintMap["{value}"]="{c}",n.bindHintMapContray["{c}"]="{value}";break;case"3":_.each(e,function(t,e){switch(t){case"x轴":n.bindHintMap["{"+a.userData[0][e]+"}"]="{b}",n.bindHintMapContray["{b}"]="{"+a.userData[0][e]+"}";break;case"图例":n.bindHintMap["{"+a.userData[0][e]+"}"]="{a}",n.bindHintMapContray["{a}"]="{"+a.userData[0][e]+"}";break;case"数据值":n.bindHintMap["{"+a.userData[0][e]+"}"]="{c}",n.bindHintMapContray["{c}"]="{"+a.userData[0][e]+"}"}})}return n}}}]).controller("editTipsCtrl",["$scope","$modal","$modalInstance","formatter",function(a,t,e,n){a.content=n,a.submit=function(){a.content===n?e.close(!1):e.close(a.content)},a.reset=function(){e.close("reset")},a.dismiss=function(){e.close(!1)}}]).controller("editLabelsCtrl",["$scope","$modal","$modalInstance","formatter",function(a,t,e,n){a.handleLabelFormatter=function(t){a.tempFormatter=angular.copy(t);var e=/\{[\s\S]*?\}/g,n=a.tempFormatter.match(e);n&&_.map(a.content.bindHintMap,function(a,t){var e=!1,i=-1;n.indexOf(a)>=0?(e=!1,r(n.indexOf(a),n,e)):n.indexOf(t)>=0?(e=!0,r(n.indexOf(t),n,e)):r(i)})};var r=function(t,e,n){t>=0&&(n?a.tempFormatter=a.tempFormatter.replace(e[t],a.content.bindHintMap[e[t]]):a.tempFormatter=a.tempFormatter.replace(e[t],a.content.bindHintMapContray[e[t]]))};a.content=n,"54"===a.tempChart.compId||"993"===a.tempChart.compId?a.labelFormatter=a.tempChart.simpleJson.option.properties.series.items.anyOf[1].properties.label.properties.normal.properties.formatter["default"]:a.labelFormatter=a.tempChart.simpleJson.option.properties.series.items.anyOf[0].properties.label.properties.normal.properties.formatter["default"],a.handleLabelFormatter(a.labelFormatter),a.showFormatter=a.tempFormatter,a.submit=function(){a.handleLabelFormatter(a.showFormatter),a.labelFormatter===a.tempFormatter?e.close(!1):e.close(a.tempFormatter)},a.reset=function(){e.close("reset")},a.dismiss=function(){e.close(!1)}}]);