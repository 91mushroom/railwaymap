/*!***********************************************
 Copyright (c) 2016, Neusoft Inc.
 All rights reserved
 图表秀 Version 1.0.0 2019.3.18
 ************************************************/
Date.prototype.format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length)));for(var i in e)new RegExp("("+i+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[i]:("00"+e[i]).substr((""+e[i]).length)));return t};var _browserDetect={ie:function(){for(var t,e=3,i=document.createElement("div"),r=i.getElementsByTagName("i");i.innerHTML="<!--[if gt IE "+ ++e+"]><i></i><![endif]-->",r[0];);return e>4?e:t}(),webkit:/AppleWebKit\/([\d.]+)/i.test(navigator.userAgent)},processLayoutRatio=function(t){return void 0==t||1>t?1:t};