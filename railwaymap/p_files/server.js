/**
 * Created by kw on 2015/6/18.
 */
// 后端地址
// charts_server="https://www.tubiaoxiu.com/srv";
charts_server="https://www.tubiaoxiu.com/srv";

// 前端地址
local_server="https://www.tubiaoxiu.com";

// 多媒体资源地址
media_server="https://www.tubiaoxiu.com/srv/service/charting/resource/media?path=";

//高级分析页面
dataviz_front_server="http://www.idataviz.com/v/src/index.html";

//商城页面
mall_server="https://mall.tubiaoxiu.com";

//阿里云市场页面
aliyun_market_server = "https://market.aliyun.com/products/56014009/cmgj021768.html";

news_server = "https://public.tubiaoxiu.com";

help_server="http://www.tubiaoxiu.com/help";

// CAS登录页。在代码里需要进行判断，如果cas_server不为空，需要登录时跳到CAS登录页，否则还跳到图表秀自己的登录页。
cas_server="https://sso.tubiaoxiu.com";

// CAS默认serviceId，只在配置上CAS登录页时有意义
cas_default_service="?service=https://www.tubiaoxiu.com/srv/login/cas";

// dataviz的serviceId，只在配置上CAS登录页时有意义
dataviz_cas_service = "?service=http://www.idataviz.com/dataviz-service/login/cas";

// 社区
community_server="http://community.tubiaoxiu.com";

//兼容性处理
window.addEventListener ? window.addEventListener : window.addEventListener = window.attachEvent;

window.attachEvent ? window.xdMsgType = "onmessage" : window.xdMsgType = "message";

window.tubiaoxiuOption = {
    chartedit:{
        echartsGLCharts:['71','72','73'],
        echartsMapChart:['37','38','39','54','55','56','992','993','2076']
    }
};
// 图表的配置属性
window.datavizOption = {
    autoAxisLabelTilt : false
};
