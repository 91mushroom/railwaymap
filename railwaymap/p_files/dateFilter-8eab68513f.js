/*!***********************************************
 Copyright (c) 2016, Neusoft Inc.
 All rights reserved
 图表秀 Version 1.0.0 2019.3.18
 ************************************************/
playChartBook.filter("commentDateFilter",["dateFilter",function(e){var t=6e4,r=60*t;return function(a){if(!a)return"";var n=new Date(a),i=new Date;if(n.getFullYear()===i.getFullYear()&&n.getMonth()===i.getMonth()&&n.getDate()===i.getDate()){var u=i.getTime()-a,l=parseInt(u/r);if(0===l){var g=parseInt(u/t);return 0===g?"刚刚":g+"分钟前"}return"今天 "+e(a,"HH:mm")}return e(a,"yyyy年MM月dd日 HH:mm")}}]);