/*!***********************************************
 Copyright (c) 2016, Neusoft Inc.
 All rights reserved
 图表秀 Version 1.0.0 2019.3.18
 ************************************************/
playChartBook.factory("userDataService",function(){function r(r,a){var e=[],n="行标题",f="列标题",t="数据值";if(angular.isArray(r)){if(r[0]&&"undefined"!=typeof r[0][0])if(a)for(var o=1,u=r.length;u>o;o++)for(var i=1,l=r[0].length;l>i;i++){var h={};h[f]=r[0][i],h[n]=r[o][0],h[t]=r[o][i],e.push(h)}else for(var o=1,u=r.length;u>o;o++){for(var h={},i=0,l=r[0].length;l>i;i++)h[r[0][i]]=r[o][i];e.push(h)}else e=r;return e}}return{array2json:r}});