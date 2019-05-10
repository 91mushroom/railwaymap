/**
 * Created by zhu-yue on 2018/9/20.
 */

(function(){

    var isPlay;

    if(location){
        isPlay = (location.href.indexOf("p.html") !== -1) || (location.href.indexOf("/p/s/") !== -1) || (location.href.indexOf("export.html") !== -1);
    }else{
        isPlay = true;
    }

    window.datavizChartsOption = {
        relativeEntryPath:  isPlay ?  "./src/js/chartPro/" : "./js/chartPro/",   //html页面与主入口文件的相对路径
        relativeGeoResourcePath: isPlay ? "./src/js/chartPro/geojson/": "./js/chartPro/geojson/",  //html页面与地图资源文件的相对路径
        defaultSymbolSize : {
            min: 5,
            max: 20
        },
        autoAxisLabelTilt: false,                                //是否开启轴标签自动倾斜
        // 列表
        listChart: {
            paging: {
                requestTotalCount: true                         // 是否获取总数
            },
            mergeColumnHeader: false,                           // 合并同一类的列头
            mergeRowHeader: false,                              // 合并值相同的行头
            changeColorEvenRow: true                             //各行变色// 合并值相同的单元格
        },
        // 交叉表
        pivotChart: {
            alwaysShowDataField: false                          // 只有一个度量时，是否显示度量名称
        },
        gis: {
            Gaode: {
                key: ''
            },
            Baidu: {
                key: ''
            },
            Mapbox: {
                key: ''
            },
            Bing: {
                key: ''
            },
            WMS: {
                address: {
                    name: "服务地址",
                    type: "string",
                    url: "http://10.4.45.227:8090/iserver/services/map-china400/wms130"
                },
                coordinate: {
                    name: "坐标系",
                    type: "string",
                    kind: "EPSG:3857"
                },
                layerName: {
                    name: "地图名称",
                    type: "string",
                    title: "China"
                },
                zoom: {
                    name: "缩放层级",
                    type: "number",
                    level: 21
                },
                extent: {
                    name: "地图范围",
                    type: "array",
                    extentArr: [-20037508.34, -20037508.34, 20037508.34, 20037508.34]
                }
            },
            WMTS: {
                address: {
                    name: "服务地址",
                    type: "string",
                    url: "http://10.4.45.227:8090/iserver/services/map-world/wmts-china/1.0.0/WMTSCapabilities.xml"
                },
                coordinate: {
                    name: "坐标系",
                    type: "string",
                    kind: "EPSG:4326"
                },
                layerName: {
                    name: "地图名称",
                    type: "string",
                    title: "世界地图_Day"
                },
                zoom: {
                    name: "缩放层级",
                    type: "number",
                    level: 17
                },
                matrixSet: {
                    name: "MatrixSet名称",
                    type: "string",
                    title: "ChinaPublicServices_世界地图_Day"
                }
            }
        },
        geoCoordMap: geoCoordMap,
        regionCode: regionCode,

        //图表扩展，comp_id不可重复，为避免重复，请从10000~20000号间选择添加
        addChartLists :[
            //{"name":"newChart","categoryId":"1","themeType":0,"dataRequire":{"string":"1","number":"n","map":"0","time":"0"},"compId":"1","access":0,"accessType":0,"order":1}
        ],
        //图表分类 分类id不可重复，为避免重复，请从100~200号间选择添加
        addCategoryLists :[
            //{ "id":"100", "name":"其他类" }
        ]
    };

    //'北京': [116.4551, 40.2539]
    var geoCoordMap = {

    };

    //"中国":"1", "北京":"11",
    var regionCode = {

    };

})();