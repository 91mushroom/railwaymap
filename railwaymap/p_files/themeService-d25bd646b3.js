/*!***********************************************
 Copyright (c) 2016, Neusoft Inc.
 All rights reserved
 图表秀 Version 1.0.0 2019.3.18
 ************************************************/
charting.factory("themeResource",["$resource",function(e){var r=charts_server+"/service/charting/themedata?bookId=:chartbookId",t={query:{method:"GET",isArray:!1}};return e(r,{},t)}]).service("themeService",["themeResource","$q","model","CHART_V1","CHART_V2",function(e,r,t,i,a){function n(e,r,t,i,a,n,o){r.qualitative||(r.qualitative=r.color),r.sequential||(r.sequential=d(6,chroma.scale([_.first(r.color),"#ffffff"]))),r.diverging||(r.diverging=d(11,chroma.scale([_.first(r.color),"#ffffff",_.last(r.color)]))),r.visualMap||(r.visualMap=[r.sequential[5],r.sequential[3],r.sequential[0]]),chroma.brewer["theme"+e+"_0"]=r.qualitative,chroma.brewer["theme"+e+"_1"]=r.sequential,chroma.brewer["theme"+e+"_2"]=r.diverging,"undefined"!=typeof chartsshow&&chartsshow.theme.add("theme"+e,r);var h=_.findWhere(q,{id:e});h||(h={},q.push(h)),h.id=e,h.define=r,h.name=i,h.iconStore=n,h.isCustom=t,h.chartbookId=a,h.themeType=o}function o(){return _.findWhere(q,{id:y})}function h(e){return _.findWhere(q,{id:e})}function c(e){var r=_.findIndex(q,{id:e});r>-1&&q.pop(r)}function s(e){return y=e,"undefined"!=typeof chartsshow&&chartsshow.theme.changeTheme("theme"+e),h(e)}function u(t,i){var a=r.defer();return i&&q.length?(a.resolve(angular.copy(q)),a.promise):(e.get({chartbookId:t},function(e,r){q=[],_.each(e.object,function(e){n(e.id,e.define,e.isCustom,e.name,e.chartbookId,e.iconStore,e.themeType)}),a.resolve(angular.copy(q))},function(e,r){a.reject(e)}),a.promise)}function f(e){for(var r=e.toString().match(/\d+/g),t="#",i=0;3>i;i++)t+=("0"+Number(r[i]).toString(16)).slice(-2);return t}function l(e){return T[e]?T[e]:e}function d(e,r){var t=[],i=d3.scale.linear();i.domain([1,e]);for(var a=1;e>=a;a++){var n=r(i(a)).darken(.2).desaturate(.2)._rgb,o=n[0].toString(16);1==o.length&&(o="0"+o);var h=n[1].toString(16);1==h.length&&(h="0"+h);var c=n[2].toString(16);1==c.length&&(c="0"+c),t.push("#"+o+h+c)}return t}function m(e,r,t){var i=r.simpleJson;if(q&&!_.isEmpty(i)){var a=_.findWhere(q,{id:e});i.themeName=e,datavizCharts.registerTheme(a.id,a.define)}}function v(e){var r=this.chartThemeTypeMap[e];r||(r=0);var t=chartsshow.theme.getTheme(),i=[],a=10;switch(r){case 0:if(t.qualitative.length>=a)return void(t.color=t.qualitative);i=t.qualitative;break;case 1:if(t.sequential.length>=a)return void(t.color=t.sequential);i=t.sequential;break;case 2:if(t.diverging.length>=a)return void(t.color=t.diverging);i=t.diverging}var n=this.chroma_scale(a,chroma.scale(i));21!=e&&22!=e&&31!=e||(n=n.reverse()),t.color=n}var g={0:"qualitative",1:"sequential",2:"diverging"},p={7:0,6:0,56:0,16:0,47:0,0:0,23:0,9:0,50:0,39:0,27:0,8:1,22:0,37:1,32:0,1:0,53:0,2:0,26:0,13:0,14:0,44:0,21:1,31:1,28:0,24:0,52:0,54:0,25:0,55:0,45:0,61:0,30:0,48:0,11:0,46:0,29:0,5:0,60:1,62:1,33:1,40:0,17:0,38:0,10:0,42:0,58:0,4:0,18:0,19:0,59:1,63:1,49:0,3:0,57:0},T={red:"#ff0000",orange:"#ffa500",yellow:"#ffff00",green:"#008000",blue:"#0000ff",purple:"#800080",pink:"#ffc0cb"},q=[],y="0";return{themeType:g,chartThemeTypeMap:p,addTheme:n,getCurrentTheme:o,getThemeById:h,removeThemeById:c,changeTheme:s,queryThemes:u,chroma_scale:d,rgbToHex:f,nameToHex:l,registerThemeToChart:m,themeColorSwitch:v}}]);