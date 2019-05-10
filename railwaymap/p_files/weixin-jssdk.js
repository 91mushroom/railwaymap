/*!***********************************************
 Copyright (c) 2016, Neusoft Inc.
 All rights reserved
 图表秀 Version 1.0.0 2019.3.18
 ************************************************/
"undefined"!=typeof wx&&(window.wxx=angular.copy(wx),wx=void 0),angular.module("weixin-jssdk",[]).service("WeixinSDK",["$http",function(e){this.config=function(n,i,s,t){e.get(charts_server+"/service/weixin/sign",{params:{url:n.split("#")[0]}}).success(function(e){if(e.object){var n=e.object;wxx.config({debug:!1,appId:n.appId,timestamp:n.timestamp,nonceStr:n.nonceStr,signature:n.signature,jsApiList:["onMenuShareTimeline","onMenuShareAppMessage"]}),wxx.ready(function(){wxx.onMenuShareTimeline(i||{}),wxx.onMenuShareAppMessage(s||{})}),wxx.error(function(e){t||t(e)})}})}}]);