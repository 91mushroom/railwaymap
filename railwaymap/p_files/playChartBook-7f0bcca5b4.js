/**
 * Created by lian-sh on 2015/5/27.
 */
playChartBook.controller('playChartBook', ['$scope','$rootScope', '$q', 'ngAudio','$http', '$localStorage', '$modal', 'userDataService', 'themeService', 'toaster', 'chartEngineManager', 'CHART_V1', 'CHART_V2', 'WeixinSDK',
    function ($scope, $rootScope, $q, ngAudio,$http, $localStorage, $modal, userDataService ,themeService, toaster, chartEngineManager, CHART_V1, CHART_V2, WeixinSDK) {
        $scope.CHART_V1 = CHART_V1;
        $scope.CHART_V2 = CHART_V2;
        $scope.MOBILE_LAYOUT_SIZE = {
            width: 414,
            height: 736
        };
        //音乐图标图片转动类;
        $scope.searchAnim = null ;
        $scope.musicMediaSaved = {autoPlayList: "", musicMediaSelect:{musicId: 0,musicFileName: "未选择",musicPath: ""}};
        $scope.playingItem = null;
        $scope.showMusicIcon = true ;
        // widget文字大下默认设置
        var textFontSize = 16 + 'px';
        var params = {};
        var paramsStrings = location.search.substr(1).split('&');
        var urltoparams = location.toString();
        var reg =/\/p\/s\/([a-zA-Z0-9]+)/;
        var finalparams = urltoparams.match(reg);

        for (var i = 0; i < paramsStrings.length; i++) {
            var kv = paramsStrings[i].split("=");
            params[kv[0]] = kv[1];
        }
        //分享的链接如果是伪静态链接进行如下的操作
        if(finalparams) {
            params['s'] = finalparams[1];
        }

        $scope.logoHref = cas_server ? '../../index.html':'index.html';
        //是否是单文件html导出
        $scope.htmlexport = window.htmlexport === true;

        var ua = navigator.userAgent;
        // 写入全局变量用来控制滑动按钮的样式
        window.isMobile = $scope.isMobile = !!ua.match(/AppleWebKit.*Mobile.*/);
        var isAndroid = /(?:Android)/.test(ua);
        var isFireFox = /(?:Firefox)/.test(ua);
        $scope.isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua));
        $scope.isPhone = $scope.isMobile && !$scope.isTablet;

        $scope.isWebMode = params.hasOwnProperty('web_mode');   //移动端强制使用网页模式且不显示转换按钮
        $scope.isAutoFit = params.hasOwnProperty('auto_fit');   //宽高自适应模式
        $scope.isNoSideBar = $scope.htmlexport || params.hasOwnProperty('no_sidebar');   //强制隐藏右边栏
        $scope.isFullWidth = params.hasOwnProperty('full_width') || $scope.isMobile;   // 适应屏幕宽度
        $scope.isFromOffice = params.hasOwnProperty('from_office');   // 在office加载项中播放
        $scope.isChartInstance = params.hasOwnProperty('isChart'); //是否图表实例

        $rootScope.layoutRatio = 1;
        $rootScope.basicColumn = 12;

        $scope.isPlayingPic = false;
        $scope.renderTypes = {
            playOwn: 0,
            playShare: 1,
            export: 2,
            appPlayOwn: 3,
            appPlayShare: 4
        };
        window.globalIsPlayingPic = $scope.isPlayingPic;

        $scope.gridCellMargin = 5;
        $scope.gridsterOptions = {
            margins: [$scope.gridCellMargin, $scope.gridCellMargin],
            columns: $rootScope.basicColumn,
            minSizeX: 2,
            //minSizeY: 4,
            //rowHeight: (700/970*80),
            mobileModeEnabled: false,
            draggable: {
                enabled: false
            },
            resizable: {
                enabled: false
            }
        };

        var arr = location.hash.split('/');
        if (arr[1]) {
            var pageIndex = parseInt(arr[1]);
        } else {
            var pageIndex = 0;
        }

        var initChartDatas = d3.map(),
            chartDataCrosstabs = d3.map();

        //进行图册播放的类型判断
        if (params.hasOwnProperty('c') || $scope.htmlexport) {
            $scope.curRenderType = $scope.renderTypes.playOwn;
        } else if (params.hasOwnProperty('s')) {
            $scope.curRenderType = $scope.renderTypes.playShare;
        } else if (params.hasOwnProperty('print-pdf')) {
            $scope.showMusicIcon = false ;
            $scope.curRenderType = $scope.renderTypes.export;
        } else if (params.hasOwnProperty('capp')) {
            $scope.curRenderType = $scope.renderTypes.appPlayOwn;
        } else if (params.hasOwnProperty('sapp')) {
            $scope.curRenderType = $scope.renderTypes.appPlayShare;
        }

        $scope.ciCustomEvent = function(eventId, params) {
            typeof params === 'undefined' ?
                _paq.push(["eventCustom", eventId]) :
                _paq.push(["eventCustom", eventId, params]);
        };

        function getChartBookLogoImg(chartBookId){
            var deferred = $q.defer();
            var req = {
                method: 'POST',
                url: charts_server + '/service/charting/resource/book/getlogoimg',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                data: 'chartbook_id=' + chartBookId
            };
            $http(req).then(function(response) {
                    $scope.chartbooklogo =response.data.object;
                    return deferred.resolve();
            });
            return deferred.promise;
        };
        function computeSlideSizes(size) {
            ($scope.isMobile || $scope.isFullWidth || $scope.useMobileLayout) && $('#marginer').css('margin-left', 0);
            var margins = $('#marginer').length && $scope.curRenderType !== $scope.renderTypes.export ?
                2 * parseInt($('#marginer').css('margin-left')) : 0;
            if (!$scope.isChartInstance && $scope.chartBookData.showMode && $scope.chartBookData.showMode.type !== 'fit') {
                // 固定宽度模式
                $scope.slidesWidth = $scope.chartBookData.showMode.width * $rootScope.largeTextRatio;
                $scope.slidesHeight = $scope.slidesWidth / $scope.whRatio;
                $scope.slidesRatio = $scope.whRatio;
                var $scaler = $('#scaler');
                $scaler.css("width", $scope.slidesWidth).css('transform-origin', '0 0');
                if ($scope.chartBookData.showMode.type === 'scale') {
                    //导出时不进行缩放
                    if ($scope.curRenderType !== $scope.renderTypes.export) {
                        $scaler.css('transform', 'scale(' + ($(".reveal").parent().width() - margins) / $scope.slidesWidth + ')');
                    }
                }
            } else {
                //自适应模式，与原版本相同
                // w / h
                //导出时.reveal的width和height会被设成auto，导致height为0，因此换用.reveal的父容器宽高
                $scope.slidesWidth = size ? size.width - margins : $(".reveal").parent().width() - margins;
                $scope.slidesHeight = size ? size.height : $(".reveal").parent().height();
                $scope.slidesRatio = $scope.slidesWidth / $scope.slidesHeight;
            }

            $rootScope.widgetWidth = $scope.slidesWidth;
            $rootScope.widgetHeight = $scope.slidesHeight;

        }

        //此函数是用于播放自己的图册，因为只有自己的图册，传进来的才是bookId,否则只有shareCode

        var fetchPicData = function(chartBookId_or_shareCode, errorCallBack){

            //图片模式不区分图册版本，统一采用V2版本
            $scope.compatVersion = CHART_V2;

            var picUrl = charts_server + '/service/export/getimgspath?code=' + chartBookId_or_shareCode;
            if($scope.is_playing_share){
                picUrl = charts_server + '/service/export_ext/getshareimgspath?code=' + chartBookId_or_shareCode;
            }

            $http.get(picUrl).success(function(response){
                $scope.isPlayingPic = true;
                window.globalIsPlayingPic = true;
                $(".navigate-refresh").empty();
                $scope.pages = _.range(0, response.object.imgCount);
                $scope.play_page_prefix = charts_server + "/service/export_ext/getimgs?path=" + response.object.imgPath;

            }).error(function() {
                $scope.isPlayingPic = false;
                toaster.pop('info', '', '图册移动版获取失败，转向电脑版');
                errorCallBack(chartBookId_or_shareCode);
            });
        };
        function SearchAnim(opts) {
            for(var i in SearchAnim.DEFAULTS) {
                if (opts[i] === undefined) {
                    opts[i] = SearchAnim.DEFAULTS[i];
                }
            }
            this.opts = opts;
            this.timer = null;
            this.elem = document.getElementById(opts.elemId);
            this.startAnim();
        }
        SearchAnim.prototype.startAnim = function () {
            this.stopAnim();
            var _this = this;
            if(!!_this&&!!_this.elem){
            this.timer = setInterval(function () {
                var startIndex = _this.opts.startIndex;
                if (startIndex == 360) {
                    _this.opts.startIndex = 0;
                }
                _this.elem.style.transform = "rotate("+ (startIndex) +"deg)";
                _this.opts.startIndex += 5;
            }, _this.opts.delay);
            /*setTimeout(() => {
                this.stopAnim();
            }, this.opts.duration);*/
         }
        }
        SearchAnim.prototype.stopAnim = function() {
            if (this.timer != null) {
                clearInterval(this.timer);
            }
        }
        SearchAnim.DEFAULTS = {
            duration : 60000,
            delay : 300,
            direction : true,
            startIndex : 0,
            endIndex : 360
        }
        var fetchBookData = function(chartBookId) {
            var restUrl = charts_server + '/service/charting/chartbookdata/' + chartBookId;
            //获取图册信息
            if ($scope.htmlexport) {
                setChartBookData(htmlBookData).then(function () {
                    //获取主题信息
                    fetchThemeInfo();
                    //设置联动信息
                    setInteractive();
                });
            } else if($scope.isChartInstance){
                var restUrl = charts_server + '/service/chartInstance/chartInstanceData/' + chartBookId;
                $http.get(restUrl).success(function(response){
                    var data = angular.copy(response.object);
                    if(!!data.musicMediaSaved)
                    {
                        $scope.musicMediaSaved = data.musicMediaSaved;
                        if(!!$scope.musicMediaSaved&&$scope.musicMediaSaved.musicMediaSelect.musicId!=0&&$scope.showMusicIcon)
                        {
                            if($scope.musicMediaSaved.autoPlayList.split(',').map(Number).indexOf($scope.musicMediaSaved.musicMediaSelect.musicId)>-1)
                            {
                                $scope.playMusic();
                            }
                        }
                    }
                    getChartBookLogoImg(chartBookId).then(function(){
                        setChartInstanceData(data).then(function(){
                            fetchThemeInfo();
                        });
                    })
                }).error(function(){
                    toaster.pop('error','','获取图表失败');
                })
            } else{
                $http.get(restUrl).success(function (response) {
                    var data = angular.copy(response.object);
                    if(!!data.musicMediaSaved)
                    {
                        $scope.musicMediaSaved = data.musicMediaSaved;
                        if(!!$scope.musicMediaSaved&&$scope.musicMediaSaved.musicMediaSelect.musicId!=0&&$scope.showMusicIcon)
                        {
                            if($scope.musicMediaSaved.autoPlayList.split(',').map(Number).indexOf($scope.musicMediaSaved.musicMediaSelect.musicId)>-1)
                            {
                                $scope.playMusic();
                            }
                        }
                    }
                    getChartBookLogoImg(chartBookId).then(function () {
                        setChartBookData(data).then(function () {
                            //获取主题信息
                            fetchThemeInfo();
                            //设置联动信息
                            setInteractive();
                        });
                    });
                }).error(function () {
                    toaster.pop('error', '', '获取图册失败');
                });
            }
        };
        var fetchSharedBookData = function(shareCode) {
            var fromOffice = $scope.isFromOffice ? 'true' : 'false';
            var restUrl = charts_server + '/service/resource/sharing/resource?code=' + shareCode + '&fromOffice=' + fromOffice;
            var restUrlWithPass;
            var s_handler = function(response) {
                if (response.error) {
                    var errorCode = response.error.c;
                    if (errorCode === 'SEC-213' || errorCode === 'SEC-214') {
                        if (errorCode === 'SEC-214') {
                            // 密码错误
                            toaster.pop('info', '', '访问密码错误，请重新输入');
                        }
                        // 需要输入访问密码
                        var modalInstance = $modal.open({
                            templateUrl: 'src/tpl/charting/sharePass.html',
                            size: 'sm',
                            backdrop: 'static',
                            controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
                                $scope.submit = function() {
                                    $modalInstance.close($scope.pass);
                                }
                            }]
                        });
                        modalInstance.result.then(function(pass) {
                            var restUrlWithPass = restUrl + '&pass=' + pass;
                            $http.get(restUrlWithPass).success(s_handler).error(f_handler);
                        });
                    } else if (errorCode === 'SEC-216') {
                        // 需要登录
                        $scope.userLogin(function() {
                            // 登录成功后重新发送请求
                            $http.get(restUrl).success(s_handler).error(f_handler);
                        });
                    } else {
                        toaster.pop('error', '', response.error.m);
                    }
                } else {
                    var obj = response.object;
                    $scope.chartbooklogo = obj.LogoPath;
                    var iconStore = $scope.isChartInstance ? obj.resource.coverImageStore : obj.resource.iconStore;
                    //微信分享标题、摘要和图片
                    var weixinName = obj.resource.name;
                    var weixinDesc = "图表秀-拯救一切图表不开心";
                    if (obj.resource.widget) { // 图表与图册的描述变量名不同
                        weixinDesc = !!obj.resource.description ? obj.resource.description : weixinDesc;
                    } else {
                        weixinDesc = !!obj.resource.desc ? obj.resource.desc : weixinDesc;
                    }
                    var weixinImage = (iconStore.substring(0,4) == "http") ? iconStore : charts_server + '/service/charting/resource/image?path=' + iconStore;

                    WeixinSDK.config(location.href,
                        {
                            title: weixinName, // 分享标题
                            link: location.href.split('#')[0], // 分享链接
                            imgUrl: weixinImage, // 分享图标
                            success: function() {
                                /************2018老用户唤醒活动***********/
                                // 若包含活动分享码且图册是活动分享图册，则更新该分享码的阅览次数
                                // if (!!$scope.ua2018.shareId && $scope.curRenderType === $scope.renderTypes.playShare && $scope.sharedcode === $scope.ua2018.bookShareCode) {
                                //     $http({
                                //         method: 'POST',
                                //         url: charts_server + '/service/activity/ua2018/doShare',
                                //         headers: {
                                //             'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                                //         },
                                //         data: 'shareId=' + $scope.ua2018.shareId
                                //     }).then(function(response) {
                                //
                                //     });
                                // }
                                /***************** ***********************/
                            },
                            cancel: function() {

                            }
                        }, {
                            title: weixinName, // 分享标题
                            desc: weixinDesc, // 分享描述
                            link: location.href.split('#')[0], // 分享链接
                            imgUrl: weixinImage, // 分享图标
                            type: '', // 分享类型,music、video或link，不填默认为link
                            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                            success: function() {
                                /************2018老用户唤醒活动***********/
                                // 若包含活动分享码且图册是活动分享图册，则更新该分享码的阅览次数
                                // if (!!$scope.ua2018.shareId && $scope.curRenderType === $scope.renderTypes.playShare && $scope.sharedcode === $scope.ua2018.bookShareCode) {
                                //     $http({
                                //         method: 'POST',
                                //         url: charts_server + '/service/activity/ua2018/doShare',
                                //         headers: {
                                //             'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                                //         },
                                //         data: 'shareId=' + $scope.ua2018.shareId
                                //     }).then(function(response) {
                                //
                                //     });
                                // }
                                /***************** ***********************/
                            },
                            cancel: function() {

                            }
                        });
                    if ($scope.isChartInstance) {
                        setChartInstanceData(obj.resource).then(function(){
                            setInteractive();
                            // 应用主题信息
                            if (obj.theme) {
                                var themeId = obj.theme.id;
                                themeService.addTheme(themeId, obj.theme.define);
                                themeService.changeTheme(themeId);
                                setTimeout(function() { $scope.$broadcast('renderChartWidget') }, 0);
                                $scope.themeData = themeService.getCurrentTheme();

                                processStyles();
                            }

                            // 显示详情页，在移动端不显示
                            $scope.needSidebar = !$scope.isNoSideBar && !$scope.isMobile;
                            if ($scope.needSidebar) {
                                $(".detail-bar").css("display", "block");
                            }
                            $scope.sidebarShowing = false;
                            $scope.toggleSidebarShowing = function() {
                                $scope.sidebarShowing =! $scope.sidebarShowing;
                                $(".main").toggleClass("border-right");
                            };

                            $scope.isSampleBook = obj.resource.type === 1;
                            $scope.trySampleBook = function() {
                                function tryBook() {
                                    location.href = local_server +
                                    "/src/index.html#/app/charting_dashboard/" +
                                    obj.resource.id +
                                    "//";
                                }
                                $http.get(charts_server + '/service/user/briefinfo')
                                    .success(function(response) {
                                        tryBook();
                                    }).error(function(e) {
                                        $scope.userLogin(tryBook);
                                    })
                            }
                        })
                    }else{
                        setChartBookData(obj.resource).then(function() {
                            setInteractive();
                            // 应用主题信息
                            if (obj.theme) {
                                var themeId = obj.theme.id;
                                themeService.addTheme(themeId, obj.theme.define);
                                themeService.changeTheme(themeId);
                                setTimeout(function() { $scope.$broadcast('renderWidget') }, 0);
                                $scope.themeData = themeService.getCurrentTheme();

                                processStyles();
                            }

                            // 显示详情页，在移动端不显示
                            $scope.needSidebar = !$scope.isNoSideBar && !$scope.isMobile;
                            if ($scope.needSidebar) {
                                $(".detail-bar").css("display", "block");
                            }
                            $scope.sidebarShowing = false;
                            $scope.toggleSidebarShowing = function() {
                                $scope.sidebarShowing =! $scope.sidebarShowing;
                                $(".main").toggleClass("border-right");
                            };

                            $scope.isSampleBook = obj.resource.type === 1;
                            $scope.trySampleBook = function() {
                                function tryBook() {
                                    location.href = local_server +
                                    "/src/index.html#/app/charting_dashboard/" +
                                    obj.resource.id +
                                    "//";
                                }
                                $http.get(charts_server + '/service/user/briefinfo')
                                    .success(function(response) {
                                        tryBook();
                                    }).error(function(e) {
                                        $scope.userLogin(tryBook);
                                    })
                            }
                        });
                    }
                    if(!!response.object.resource.musicMediaSaved)
                    {
                        $scope.musicMediaSaved = response.object.resource.musicMediaSaved;
                        if(!!$scope.musicMediaSaved&&$scope.musicMediaSaved.musicMediaSelect.musicId!=0&&$scope.showMusicIcon)
                        {
                            if($scope.musicMediaSaved.autoPlayList.split(',').map(Number).indexOf($scope.musicMediaSaved.musicMediaSelect.musicId)>-1)
                            {
                                $scope.playMusic();
                            }
                        }
                    }
                }
            };

            var f_handler = function(response) {
                toaster.pop('error', '', '获取分享资源失败');
            };

            $http.get(restUrl).success(s_handler).error(f_handler);
        };

        $scope.userLogin = function(callback) {
            var modalInstance = $modal.open({
                templateUrl: 'src/tpl/charting/shareLogin.html',
                size: 'lg',
                backdrop: 'static',
                controller: ['$scope', '$modalInstance', '$sce', function($scope, $modalInstance, $sce) {
                    if (cas_server) {
                        $scope.loginPageUrl = $sce.trustAsResourceUrl(cas_server + cas_default_service);
                    } else {
                        $scope.loginPageUrl = $sce.trustAsResourceUrl('src/index.html#/access/signin/0');
                    }

                    $scope.dismiss = function() {
                        $modalInstance.dismiss();
                    }
                }]
            });

            window.onmessage = function(e) {
                if (e.data === 'LOGIN_SUCCESS') {
                    window.onmessage = null;
                    modalInstance.dismiss();

                    callback && callback();
                }
            };
        }

        function buildCss (bgColor) {
            var bCss;
            if (bgColor.indexOf("radial-gradient") !== -1) {
                if(navigator.userAgent.indexOf("MSIE")>0) {
                    if (_browserDetect.ie <10) {
                        //IE9纯色背景
                        bCss = {'background': '#3A3E41'}
                    } else {
                        bCss={'background': '-ms-' + $scope.themeData.define.background}
                    }
                }
                //IE11
                if (Object.hasOwnProperty.call(window, "ActiveXObject") && !window.ActiveXObject) {
                    bCss = {'background': '-ms-' + $scope.themeData.define.background}
                }
                if(navigator.userAgent.indexOf("Firefox")>0) {
                    bCss={'background':'-moz-' + $scope.themeData.define.background}
                }
                if(navigator.userAgent.indexOf("Chrome")>0) {
                    bCss={'background':"-webkit-" + $scope.themeData.define.background}
                }
                if(navigator.userAgent.indexOf("Opera")>0) {
                    bCss={'background':'-o-' + $scope.themeData.define.background}
                }
                if (!bCss) {
                    bCss={'background':"-webkit-" + $scope.themeData.define.background};
                }
            } else {
                bCss={'background': $scope.themeData.define.background};
            }

            return bCss;
        }
        //迭代让进行字体的变化
        function convertFontSize(option){
            if(option.properties){
                for(var p in option.properties){
                    if(option.properties[p]){
                        convertFontSize(option.properties[p]);
                        if(p === 'fontSize' || p === 'fontsize'){
                            option.properties[p].default = option.properties[p].default * $scope.largeRatio;
                        }
                    }
                }
            }else if(option.items&&option.items.anyOf){
                _.each(option.items.anyOf,function(item){
                    for(var p in item.properties){
                        convertFontSize(item.properties[p]);
                        if(p === 'fontSize' || p === 'fontsize' ){
                            option.properties[p].default = option.properties[p].default * $scope.largeRatio;
                        }
                    }
                });
            }else{
                return;
            }
        }

        //计算在最大列数条件下widget集合所占的最大行数
        var calcWidgetsTotalRow = function(widgets, maxCols) {
            var cols = [];
            for (var i = 0; i < maxCols; i++) {
                cols[i] = 0;
            }
            var col_cnt = 0;
            for (var i = 0; i < widgets.length; i++) {
                var col = widgets[i].define.sizeX;
                var row = widgets[i].define.sizeY;

                if (col_cnt + col > maxCols) {
                    col_cnt = 0;
                }
                for (var j = 0; j < col && col_cnt < maxCols; j++) {
                    cols[j + col_cnt] += row;
                }
                col_cnt += col;
            }
            return Math.max.apply(null, cols);
        };

        function setChartBookData(data) {

            var defer = $q.defer();
            document.title = data.name ? data.name : '图表秀';
            $scope.compatVersion = data.compatVersion;
            $scope.picpages = [];
            $scope.chartBookData = data;
            $scope.chartBookData.showMode || ($scope.chartBookData.showMode = {
                type: 'fit',
                width: screen.width
            });
            var bookPages = $scope.chartBookData.pages;
            $scope.whRatio = 1.1;   //宽高比
            //判断url是否包含导出高清图的参数
            if(typeof(params.largeRatio)!=='undefined'){
                $rootScope.largeTextRatio = params.largeRatio;
                $rootScope.largeTextRatio = parseFloat($rootScope.largeTextRatio);
            }else{
                $rootScope.largeTextRatio = 1;
            }

            //仅用于导出，会根据图册保存时的布局模式使用相应布局来导出
            $scope.isMobileLayout = !!$scope.chartBookData.isMobileLayout;

            var max_rows = 1;
            var chartsUsed = [];
            $scope.supportMobileLayout = true;
            // 转换数据
            _.each(bookPages, function(page,context) {
                var row_cnt = calcWidgetsTotalRow(page.layout.widget, $scope.gridsterOptions.columns);
                max_rows = row_cnt > max_rows ? row_cnt : max_rows;
                _.each(page.layout.widget, function(widget) {

                    //检查是否支持移动端布局
                    if ($scope.supportMobileLayout && !widget.defineMobile) {
                        $scope.supportMobileLayout = false;
                    }

                    if ($scope.isAutoFit) {
                        widget.define.sizeY = ($scope.gridsterOptions.columns / $rootScope.widgetWidth * $rootScope.widgetHeight) / row_cnt * widget.define.sizeY;
                        if (widget.defineMobile) {
                            widget.defineMobile.sizeY = ($scope.gridsterOptions.columns / $rootScope.widgetWidth * $rootScope.widgetHeight) / row_cnt * widget.defineMobile.sizeY;
                        }
                    }
                    if (widget.type === 'chart') {
                        $scope.compatVersion === CHART_V2 && chartsUsed.push(widget.resource.compId);
                        var data = widget.resource.userData;
                        widget.resource.userData = JSON.parse(data);
                        if($scope.curRenderType === $scope.renderTypes.export){
                            var resource = widget.resource;
                            if(tubiaoxiuOption.chartedit.echartsGLCharts.indexOf(resource.compId) !== -1){
                                if(params.shot){
                                    mapCharts.push({
                                        pageIndex: context,
                                        id: widget.resource.id
                                    });
                                    totalChartCount++;
                                }else{
                                    widget.type = 'image';
                                    widget.resource = {
                                        imageStore: charts_server + '/service/export/image?name=' + context + '_' + widget.resource.id
                                    }
                                }
                            }else{
                                totalChartCount++;
                            }
                        }

                    }else if(widget.type === 'text'){
                        if($scope.curRenderType === $scope.renderTypes.export && $rootScope.largeTextRatio !== 1){
                            var textReg = /(font-size):\d+/g;
                            var numberReg  = /\d+/;
                            var results = widget.resource.content.match(textReg);
                            _.each(results,function(result){
                                widget.resource.content = widget.resource.content.replace(result, 'font-size:' + parseFloat(result.match(numberReg)[0]) * $rootScope.largeTextRatio);
                            });
                            $scope.textFontSize = textFontSize.match(numberReg)[0] * $rootScope.largeTextRatio + 'px';
                        }
                    }else if(widget.type === 'icon'){
                        if($scope.curRenderType === $scope.renderTypes.export && $rootScope.largeTextRatio !== 1){
                            widget.resource.iconFontSize = widget.resource.iconFontSize * $rootScope.largeTextRatio;
                        }
                    }
                });
            });
            if (typeof(totalChartCount) !== 'undefined' && totalChartCount == 0) {
                setTimeout(function() {
                    isRenderFinished = true;
                }, 1000);
            } else {
                Reveal.addEventListener('slidechanged', function (event) {
                    // event.previousSlide, event.currentSlide, event.indexh, event.indexv
                    if (!Reveal.isOverview() && event.previousSlide) {
                        setTimeout(function () {
                            refreshCharts(event.indexh);
                        }, 0);
                    }
                });
            }

            //判断是否使用移动端布局：
            //1. 图册设置过移动端布局
            //2. 在手机端播放
            //3. 如果不是在手机端播放，但是为预览播放或导出，且图册保存时处于移动端布局状态
            $scope.useMobileLayout = $scope.supportMobileLayout &&
                ($scope.isPhone ||
                    (($scope.curRenderType === $scope.renderTypes.playOwn || $scope.curRenderType === $scope.renderTypes.export)
                        && $scope.chartBookData.isMobileLayout));

            //加载图表引擎，单文件html时isPlay为false防止懒加载
            chartEngineManager.loadEngine($scope.compatVersion, !$scope.htmlexport, chartsUsed).then(function() {
                //对于导出，注册对应图册版本的图表渲染完成事件
                if ($scope.curRenderType === $scope.renderTypes.export) {
                    if ($scope.compatVersion === CHART_V1) {
                        chartsshow.message.subscribe('renderFinished', renderFinishCallback);
                    } else if ($scope.compatVersion === CHART_V2) {
                        $scope.$on('chartRenderDone', renderFinishCallback);
                    }
                }

                $scope.currentChartBookId = $scope.chartBookData.id;
                $scope.pagesTotalCount = bookPages.length;
                $scope.pages = bookPages;
                if (pageIndex >= $scope.pagesTotalCount) {
                    $scope.currentSelectedPageIndex = $scope.pagesTotalCount - 1;
                } else {
                    $scope.currentSelectedPageIndex = pageIndex;
                }
                $scope.themeId = $scope.chartBookData.themeId;

                //进行会员特权相关元素的添加和删除
                //播放自己图册及导出时应该检查当前用户的权限，播放分享图册时应该检查图册作者的权限
                var dataUserId = $scope.curRenderType === $scope.renderTypes.playShare ? $scope.chartBookData.ownerId : "";
                var req = dataUserId === "" ? {  //获取当前用户的权限
                    method: 'GET',
                    url: charts_server + '/service/user/limits',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    }
                } : {                           //获取图册作者的权限
                    method: 'POST',
                    url: charts_server + '/service/user/limits_by_id',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    },
                    data: "&userId=" + dataUserId
                };
                $scope.isNoLogo = false;
                $scope.logoSrc = $scope.useMobileLayout ? 'src/img/mob_logo-e44e18498c.png' :
                    ($scope.themeId === 3 ? 'src/img/logo_play_white-13ca9bfc52.png' : 'src/img/logo_play-4c814731bc.png');
                $scope.htmlexport || $http(req).then(
                    function(response) {
                        //图表秀官方账号始终显示LOGO
                        if (response.data.error || $scope.chartBookData.ownerId === 'c5feb87d-7d73-401d-ba2f-afb102d4b95e') {
                            $scope.isNoLogo = false;
                        } else {
                            $scope.limits = angular.copy(response.data.object);
                            switch ($scope.curRenderType) {
                                case $scope.renderTypes.playOwn:
                                    if ($scope.limits.isnologoplay) {
                                        $scope.isNoLogo = true;
                                        if($scope.chartbooklogo) {
                                            $scope.isNoLogo = false;
                                            $scope.logoSrc = $scope.chartbooklogo;
                                        }
                                    } else {
                                        $scope.chartbooklogo = null;
                                    }
                                    break;
                                case $scope.renderTypes.playShare:
                                    if ($scope.limits.isnologoshare) {
                                        $scope.isNoLogo = true;
                                        if($scope.chartbooklogo){
                                            $scope.isNoLogo = false;
                                            $scope.logoSrc = $scope.chartbooklogo;
                                        }
                                    } else {
                                        $scope.chartbooklogo = null;
                                    }
                                    break;
                                case $scope.renderTypes.export:
                                    if ($scope.limits.isnologo) {
                                        $scope.isNoLogo = true;
                                        if($scope.chartbooklogo){
                                            $scope.isNoLogo = false;
                                            $scope.logoSrc = $scope.chartbooklogo;
                                        }
                                    } else {
                                        $scope.chartbooklogo = null;
                                    }
                                    break;
                            }

                            $scope.showMobileAdPage = $scope.useMobileLayout && !($scope.isNoLogo || $scope.chartbooklogo);
                            window.pageCount = $scope.showMobileAdPage ? $scope.pages.length + 1 : $scope.pages.length;
                            if (window.pageCount < 2) { //页数为1时隐藏控制器
                                $('.reveal .controls').hide();
                            } else {
                                $('.reveal .controls').show();
                            }
                        }
                    }, function() {
                        $scope.isNoLogo = false;
                    });

                $rootScope.layoutRatio = processLayoutRatio($scope.chartBookData.layoutRatio);
                $scope.gridsterOptions.columns = $rootScope.basicColumn *  $rootScope.layoutRatio;
                // 以行数最多页的宽高比作为reveal使用的宽高比
                $scope.whRatio = $scope.gridsterOptions.columns / max_rows;

                computeSlideSizes($scope.useMobileLayout && $scope.curRenderType !== $scope.renderTypes.export && !$scope.isPhone ? $scope.MOBILE_LAYOUT_SIZE : null);

                $rootScope.gridCellWidth =  ($rootScope.widgetWidth - $scope.gridCellMargin) /  $scope.gridsterOptions.columns;

                if ($scope.isFromOffice) {
                    $('.reveal').css("overflow", "hidden");
                } else if (!$scope.isMobile) {
                    $(".reveal").perfectScrollbar();
                    if ($scope.chartBookData.showMode.type === "actual") {
                        $(".ps-scrollbar-x-rail").css("cssText", "display: block !important");
                    }
                }
                defer.resolve();
            });

            return defer.promise;
        }

        function setChartInstanceData(data){
            var defer = $q.defer();
            $scope.chartInstanceData = data;
            $scope.compatVersion = CHART_V2;
            $scope.widget = {};
            $scope.widget.resource = $scope.chartInstanceData.widget;
            $scope.widget.resource.resource.userData = JSON.parse($scope.widget.resource.resource.userData);
            $scope.themeId = $scope.chartInstanceData.themeId;
            var chartsUsed = [];
            chartsUsed.push($scope.chartInstanceData.widget.resource.compId);
            chartEngineManager.loadEngine($scope.compatVersion, !$scope.htmlexport, chartsUsed).then(function(){
                var dataUserId = $scope.curRenderType === $scope.renderTypes.playShare ? $scope.chartInstanceData.ownerId : "";
                var req = dataUserId === "" ? {  //获取当前用户的权限
                    method: 'GET',
                    url: charts_server + '/service/user/limits',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    }
                } : {                           //获取图册作者的权限
                    method: 'POST',
                    url: charts_server + '/service/user/limits_by_id',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    },
                    data: "&userId=" + dataUserId
                };
                $scope.isNoLogo = false;
                $http(req).then(function(response){
                    if (response.data.error || $scope.chartInstanceData.ownerId === 'c5feb87d-7d73-401d-ba2f-afb102d4b95e') {
                        $scope.isNoLogo = false;
                    } else {
                        $scope.limits = angular.copy(response.data.object);
                        switch ($scope.curRenderType) {
                            case $scope.renderTypes.playOwn:
                                if ($scope.limits.isnologoplay) {
                                    $scope.isNoLogo = true;
                                    if($scope.chartbooklogo){
                                        $scope.isNoLogo = false;
                                        $("img[alt='图表秀Logo']").attr("src",$scope.chartbooklogo);
                                    }
                                }
                                break;
                            case $scope.renderTypes.playShare:
                                if ($scope.limits.isnologoshare) {
                                    $scope.isNoLogo = true;
                                    if($scope.chartbooklogo){
                                        $scope.isNoLogo = false;
                                        $("img[alt='图表秀Logo']").attr("src",$scope.chartbooklogo);

                                    }
                                }
                                break;
                        }
                    }
                },function(){
                    $scope.isNoLogo = false;
                });
                defer.resolve();
            });
            return defer.promise;
        }

        function processStyles() {
            var bgStyle = {},
                revealStyle;

            if ($scope.themeData.define.backgroundImage) {
                bgStyle['background-image'] = 'url(' + $scope.themeData.define.backgroundImage + ')';
            }

            if ($scope.curRenderType === $scope.renderTypes.export) {
                $scope.revealStyle = buildCss($scope.themeData.define.background);
            } else {
                revealStyle = buildCss($scope.themeData.define.background);
                $scope.mainStyle = revealStyle;
            }

            if ($scope.curRenderType !== $scope.renderTypes.export && !$scope.isChartInstance) {
                setBgStyle($scope.currentSelectedPageIndex, bgStyle, revealStyle);
                Reveal.addEventListener('slidechanged', function (event) {
                    setBgStyle(event.indexh, bgStyle, revealStyle);
                });
            }

            if ($scope.isFullWidth) {
                var style = document.createElement("style");
                style.type = "text/css";
                style.innerHTML = ".widget-box-content {padding: 10px !important}";
                (document.head || document.getElementsByTagName("head")[0]).appendChild(style);
            }

            if ($scope.useMobileLayout && $scope.curRenderType !== $scope.renderTypes.export) {
                $scope.mainStyle['max-width'] = $scope.MOBILE_LAYOUT_SIZE.width + 'px';
                $scope.mainStyle['max-height'] = $scope.MOBILE_LAYOUT_SIZE.height + 'px';
                if (!$scope.isMobile) {
                    $scope.mainStyle['border'] = "1px dashed #07bf84";
                }
            }
        }

        function setBgStyle(pageIndex, bgStyle, revealStyle) {
            if (pageIndex >= $scope.pages.length) {
                return;
            }

            if (revealStyle) {
                var style = $scope.revealStyle = angular.copy(revealStyle);
            } else {
                var style = $scope.bgStyle = angular.copy(bgStyle);
            }

            var currentPage = $scope.pages[pageIndex];
            if (!$scope.useMobileLayout && currentPage.options && currentPage.options.backgroundImage) {
                delete style['background'];
                style['background-image'] = 'url(' + currentPage.options.backgroundImage + ')';
                $scope.mainStyle = revealStyle;
                if (currentPage.options.backgroundMode === 1) {
                    style['background-size'] = '100% 100%';
                }
            } else if ($scope.useMobileLayout && currentPage.options && currentPage.options.backgroundImageMobile) {
                delete style['background'];
                style['background-image'] = 'url(' + currentPage.options.backgroundImageMobile + ')';
                $scope.mainStyle = revealStyle;
                if (currentPage.options.backgroundModeMobile === 1) {
                    style['background-size'] = '100% 100%';
                }
            } else {
                $scope.revealStyle['background'] = 'transparent';
            }
        }

        $scope.getBgStyle = function(page) {
            var styleStr;
            if (!$scope.useMobileLayout && page.options && page.options.backgroundImage) {
                styleStr = 'background-image:url(' + page.options.backgroundImage + ')';
                if (page.options.backgroundMode === 1) {
                    styleStr += ';background-size:100% 100%';
                }
            } else if ($scope.useMobileLayout && page.options && page.options.backgroundImageMobile) {
                styleStr = 'background-image:url(' + page.options.backgroundImageMobile + ')';
                if (page.options.backgroundModeMobile === 1) {
                    styleStr += ';background-size:100% 100%';
                }
            } else if ($scope.themeBgImage) {
                styleStr = 'background-image:url(' + $scope.themeBgImage + ')';
            }
            return styleStr;
        };

        function setInteractive () {
            //设置图表间联动信息
            $scope.pages.forEach(function(page, pageIndex) {
                var interactions = page.interaction;
                //保存各图表初始数据
                page.layout.widget.forEach(function(obj, i) {
                    if (obj.type == 'chart') {
                        initChartDatas.set(obj.resource.id, obj.resource.userData);
                        chartDataCrosstabs.set(obj.resource.id, obj.resource.dataCrosstab);
                    }
                });
                //解析交互联动设置
                if (interactions) {
                    interactions.forEach(function(obj, i){
                        var topic = obj.from + "_click";
                        //订阅图表对应主题消息
                        if (typeof(chartsshow) !== 'undefined') {
                            chartsshow.message.subscribe(topic, function (data) {
                                var fromValue = data[obj.mapping.fromField];

                                var toChartData = initChartDatas.get(obj.to),
                                    toChartDataCrosstab = chartDataCrosstabs.get(obj.to);

                                var toChartJsonData = userDataService.array2json(toChartData, toChartDataCrosstab);

                                var findObj = {};
                                findObj[obj.mapping.toField] = fromValue;

                                var toChartFilterData = _.where(toChartJsonData, findObj);

                                //将筛选结果应用到图表的userData，并重绘图表
                                $rootScope.$broadcast("interactiveChart", {id: obj.to, data: toChartFilterData})
                            })
                        }
                    })
                }
            })
        }

        window.refreshCharts = function refreshCharts(index) {
            if ($scope.chartBookData.compatVersion === $scope.CHART_V1) {
                $scope.pages[index].layout.widget.forEach(function (obj) {
                    if (obj.type == 'chart') {
                        var ChartData = initChartDatas.get(obj.resource.id),
                            ChartDataCrosstab = chartDataCrosstabs.get(obj.resource.id);
                        var toChartJsonData = userDataService.array2json(ChartData, ChartDataCrosstab);
                        $scope.$broadcast("interactiveChart", {id: obj.resource.id, data: toChartJsonData});
                    }
                });
            } else {
                // 只刷新当前页的图表
                var $charts = $('section.present').find('.chart');
                _.each($charts, function(chart) {
                    $(chart).scope().$emit('renderWidget');
                });
            }
        };

        function fetchThemeInfo() {
            var setTheme = function(theme) {
                var themes = theme;
                var len = themes.length;
                for(var i = 0; i<len; i++){
                    var themeId = themes[i].id;
                    var themeData = _.findWhere(themes, {id : themeId});

                    themeService.addTheme(themeId, themeData.define);
                    //应用主题信息
                    if ($scope.themeId === themeId) {
                        themeService.changeTheme(themeId);
                        $scope.isChartInstance ? $scope.$broadcast("renderChartWidget") : $scope.$broadcast('renderWidget');
                        $scope.themeData = themeService.getCurrentTheme();
                    }
                }

                if (!$scope.themeData) {
                    $scope.themeId = "0";
                    themeService.changeTheme($scope.themeId);
                    $scope.isChartInstance ? $scope.$broadcast("renderChartWidget") : $scope.$broadcast('renderWidget');
                    $scope.themeData = themeService.getCurrentTheme();
                }

                processStyles();
            };

            if ($scope.htmlexport) {
                setTheme(htmlTheme);
            } else {
                var queryThemeId = $scope.isChartInstance ? $scope.chartInstanceData.id : $scope.chartBookData.id;
                var themeUrl = charts_server + '/service/charting/themedata/?bookId=' + queryThemeId;
                $http.get(themeUrl).success(function (response) {
                    setTheme(response.object);
                });
            }
        }

        $scope.playMusic =function () {
            if (!$scope.playingItem&&!!$scope.musicMediaSaved.musicMediaSelect.musicId!=0&&$scope.showMusicIcon)
            {
                $scope.playingItem = ngAudio.load($scope.musicMediaSaved.musicMediaSelect.musicPath);
                $scope.playingItem.setVolume(0.8);
                $scope.playingItem.loop = 100 ;
            }
            if(!!$scope.playingItem&&$scope.showMusicIcon)
            {
                  $scope.playingItem.play();
            }
            if(!$scope.searchAnim)
            {
                $scope.searchAnim = new SearchAnim({
                    elemId : "musicPlayIcon",
                    delay : 30,
                });
            }
            else {
                $scope.searchAnim.startAnim();
            }
        }
        $scope.pauseMusic = function() {
            if (!!$scope.playingItem)
            {
                $scope.playingItem.pause();
            }
            if(!!$scope.searchAnim)
            {
                $scope.searchAnim.stopAnim();
            }
        };
        $scope.exchangePlayStatus = function () {
            if(!!$scope.playingItem &&!$scope.playingItem.paused)
            {
                $scope.pauseMusic();
            }
            else{
                $scope.playMusic();
            }
        }

        $scope.is_can_toggle = false;
        $scope.is_playing_share = false;
        $scope.sharedcode = "";
        $scope.chartbookId = "";

        globalIsPlayingPic = $scope.isPlayingPic;

        $scope.toggle_play = function () {


            if($scope.isPlayingPic){ //转为播放电脑版
                if($scope.is_playing_share){
                    $scope.isPlayingPic = false;
                    fetchSharedBookData($scope.sharedcode);
                }else{
                    $scope.isPlayingPic = false;
                    fetchBookData($scope.chartbookId);
                }

            }else{ //转为播放图片版
                if($scope.is_playing_share){
                    fetchPicData($scope.sharedcode,fetchSharedBookData);
                }else{
                    fetchPicData($scope.chartbookId,fetchBookData);
                }
            }
        };

        if ($scope.curRenderType === $scope.renderTypes.playOwn) {
            // 播放
            $scope.is_playing_share = false;
            $scope.chartbookId = params['c'];
            $scope.isPlayingPic = false;
            fetchBookData($scope.chartbookId);
        } else if ($scope.curRenderType === $scope.renderTypes.playShare) {
            // 分享
            $scope.is_playing_share = true;
            $scope.sharedcode = params['s'];
            $scope.isPlayingPic = false;
            fetchSharedBookData($scope.sharedcode);
        }else if($scope.curRenderType === $scope.renderTypes.export){
            // 导出
            fetchBookData(params['print-pdf']);

        }else if($scope.curRenderType === $scope.renderTypes.appPlayOwn){
            $scope.isPlayingPic = false;
            fetchBookData(params['capp']);

        }else if($scope.curRenderType === $scope.renderTypes.appPlayShare){
            $scope.isPlayingPic = false;
            fetchSharedBookData(params['sapp']);
        }

        /************2018老用户唤醒活动***********/
        // $scope.ua2018 = {
        //     shareId: params.hasOwnProperty('uaCode') ? params['uaCode'] : null,
        //     bookShareCode: '915e24a23e029a2f'
        // };
        // // 若包含活动分享码且图册是活动分享图册，则更新该分享码的阅览次数
        // if (!!$scope.ua2018.shareId && $scope.curRenderType === $scope.renderTypes.playShare && $scope.sharedcode === $scope.ua2018.bookShareCode) {
        //     $http({
        //         method: 'POST',
        //         url: charts_server + '/service/activity/ua2018/updateShareCount',
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        //         },
        //         data: 'shareId=' + $scope.ua2018.shareId
        //     }).then(function(response) {
        //
        //     });
        // }
         /***************** ***********************/

        $scope.currentSelectedPageIndex = -1;
        $scope.pagesTotalCount = 0;
        $scope.currentChartBookId = '';
        $scope.pages = [];
        $scope.picpages = [];
        $scope.isSaveAs = false;
        $scope.isShowRight = true;
        $scope.dashboard_themes = [];

        $(window).resize(_.debounce(function() {
            if ($scope.isAutoFit) {
                window.location.reload();
            }else if(!$scope.isChartInstance) {
                computeSlideSizes();

                Reveal.configure({
                    width: $scope.slidesWidth,
                    height: $scope.slidesHeight
                });
                if (window.pageCount < 2) { //页数为1时隐藏控制器
                    $('.reveal .controls').hide();
                } else {
                    $('.reveal .controls').show();
                }
                $rootScope.gridCellWidth = ($rootScope.widgetWidth - $scope.gridCellMargin) /  $scope.gridsterOptions.columns;

                // 图表需要重绘，这里借用renderWidget事件
                $scope.$broadcast('renderWidget');
            }

            // $scope.isFullWidth && $(".reveal").perfectScrollbar("update");
            if ($scope.isFromOffice) {
                $(".reveal .progress").hide();
            } else if (!$scope.isMobile) {
                $(".reveal").perfectScrollbar('update');
            }

        }, 500));

        if ($scope.htmlexport) {    //单html导出存在初次加载不显示图表的问题，手动render一下
            $(window).ready(function () {
                $scope.$broadcast('renderWidget');
            });
        }

        //新图表联动触发，受联动的图表各自计算相应的userData并重绘
        $scope.$on('interaction-trigger-emit', function(event, msg) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            $scope.$broadcast('interaction-trigger-broadcast', msg);
        });
        //新图表联动恢复，受联动的图表使用原始userData重绘
        $scope.$on('interaction-recover-emit', function(event, msg) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            $scope.$broadcast('interaction-recover-broadcast', msg);
        });
    }])
    .controller('sidebarController', ['$scope', '$rootScope', '$http', '$localStorage', 'toaster', '$modal', function($scope, $rootScope, $http, $localStorage, toaster, $modal) {

        // 跳转到社区个人主页
        $scope.goToCommunity = function(userId) {
        // 暂时不跳
            if (community_server) {
                var url = community_server + "/portal/intranet/chartbooks/" + userId;
                window.open(url);
            }
        }


        $http.get(charts_server + '/service/charting/chartbookinfo_ex/' + $scope.currentChartBookId)
        .success(function (response) {
            $scope.chartBook = response.object;
        }).error(function () {
            toaster.pop('error', '', '获取图册信息失败');
        });

        var s_handler = function(response) {
            if (response.error) {
                toaster.pop('error', '', '获取用户信息失败');
            } else {
                $scope.userinfo = response.object;
            }
        };
        var f_handler = function(data, status) {
            if (status === 401) {
                // 需要登录
            } else {
                toaster.pop('error', '', '出错了，请稍后再试');
            }
        }

        // 取当前用户信息
        $scope.fetchCurrentUserInfo = function() {
            $http.get(charts_server + '/service/user/briefinfo').success(s_handler).error(f_handler);
        };

        $scope.fetchCurrentUserInfo();

        var fetchChartBookComments = function() {
            $http.get(charts_server + '/service/social/comment/' + $scope.currentChartBookId + '/' + commentPageCount + '/' + commentPageNO)
                .success(function(response) {
                    $scope.comment.list = response.object.items;
                    // 每次都取总数重新计算，因为总数随时可能会变化
                    var commentTotal = response.object.total;
                    if(commentTotal > commentPageCount) {
                        paginatorOptions.totalPages = Math.ceil(commentTotal / commentPageCount);
                        paginatorOptions.currentPage = commentPageNO + 1;
                        $('#paginator').bootstrapPaginator(paginatorOptions);
                    }else{
                        $('#paginator').addClass('hidden');
                    }
                    //if (commentTotal <= commentPageCount * (commentPageNO + 1)) {
                    //    $("#more-comments").addClass('hidden');
                    //}
                }).error(function() {
                    toaster.pop('error', '', '获取评论内容失败');
                });
        };

        // 取评论内容
        var commentPageCount = 6;
        var commentPageNO = 0;
        $scope.comment = {
            list: [],
            value: '',
            active: false,
            maxLength: 255
        };
        fetchChartBookComments();

        //$("#more-comments").click(function(e) {
        //    e.preventDefault();
        //    commentPageNO++;
        //    fetchChartBookComments();
        //});

        var loginConfirm = function(modalInfo) {
            var modalInstance = $modal.open({
                templateUrl: 'src/tpl/playchartbook/userLoginConfirm.html',
                size: 'sm',
                controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
                    $scope.modalInfo = modalInfo;
                    $scope.dismiss = function() {
                        $modalInstance.dismiss();
                    };
                    $scope.submit = function () {
                        $modalInstance.close();
                    }
                }]
            });
            modalInstance.result.then(function() {
                $scope.userLogin();
            });
        };

        $scope.addComment = function() {

            $http.post(charts_server + '/service/social/comment/' + $scope.currentChartBookId, {content: $scope.comment.value})
                .success(function(response) {
                    if (response.error) {
                        toaster.pop('error', '', '评论失败');
                    } else {
                        // 评论数加1
                        $scope.chartBook.stats.comCount++;
                        // 插入评论
                        $scope.comment.list.unshift({
                            id: response.object,
                            content: $scope.comment.value,
                            time: '刚刚',
                            owner: $scope.userinfo
                        });
                        $scope.resetComment();
                    }
                }).error(function(data, status) {
                    if (status === 401) {
                        loginConfirm('会话超时，请重新登录');
                    } else {
                        toaster.pop('error', '', '出错了，请稍后再试');
                    }
                })
        };

        $scope.removeComment = function(commentId) {
            var modalInstance = $modal.open({
                templateUrl: 'src/tpl/charting/operationConfirm.html',
                size: 'sm',
                controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
                    $scope.message = '确定删除该条评论吗？';
                    $scope.dismiss = function() {
                        $modalInstance.dismiss();
                    };
                    $scope.submit = function () {
                        $modalInstance.close();
                    }
                }]
            });

            modalInstance.result.then(function() {
                $http.delete(charts_server + '/service/social/comment/' + commentId)
                    .success(function(response) {
                        if (response.error) {
                            toaster.pop('error', '', '删除评论失败');
                        } else {
                            // 评论数减1
                            $scope.chartBook.stats.comCount--;
                            // 移除评论条目
                            $scope.comment.list = _.reject($scope.comment.list, function(comment) {
                                return comment.id === commentId;
                            });
                        }
                    }).error(function(data, status) {
                        if (status === 401) {
                            loginConfirm('会话超时，请重新登录');
                        } else {
                            toaster.pop('error', '', '出错了，请稍后再试');
                        }
                    });
            });

        };

        $scope.updateCommentValue = function() {
            var commentValue = $('.comment-box').val();
            if (commentValue.length > $scope.comment.maxLength) {
                commentValue = commentValue.substr(0, $scope.comment.maxLength);
                $('.comment-box').val(commentValue);
            }
            $scope.comment.value = commentValue;
        }

        $scope.resetComment = function() {
            $('.comment-box').val('');
            $scope.comment.value = '';
            $scope.comment.active = false;
        }

        $scope.likeRequesting = false;
        $scope.addLiking = function () {
            if ($scope.likeRequesting) {
                return;
            }
            $scope.likeRequesting = true;
            $http.post(charts_server + '/service/social/liking/' + $scope.currentChartBookId)
                .success(function (response) {
                    if (response.error) {
                        var errorCode = response.error.c;
                        if (errorCode === 'BOOKS-201') {
                            // 已经赞过了
                            $scope.chartBook.stats.liked = true;
                        } else if (errorCode === 'SEC-216') {
                            // 需要登录
                            loginConfirm('您的IP地址已经赞过了，继续点赞请先登录');
                        } else {
                            toaster.pop('error', '', '赞失败了');
                        }
                    } else {
                        // 赞数加1
                        $scope.chartBook.stats.liked = true;
                        $scope.chartBook.stats.likCount++;
                    }
                    $scope.likeRequesting = false;
                }).error(function () {
                    toaster.pop('error', '', '出错了，请稍后再试');
                    $scope.likeRequesting = false;
                });
        };

        $scope.alreadyLiked = function() {
            toaster.pop('info', '', '您已经赞过了');
        };

        $scope.favoriteRequesting = false;
        $scope.addFavorite = function() {
            if ($scope.favoriteRequesting) {
                return;
            }
            $scope.favoriteRequesting = true;
            $http.post(charts_server + '/service/social/favorite/' + $scope.currentChartBookId)
                .success(function(response) {
                    if (response.error) {
                        var errorCode = response.error.c;
                        if (errorCode === 'BOOKS-101') {
                            // 已经收藏过了
                            $scope.chartBook.stats.favorite = true;
                        } else {
                            toaster.pop('error', '', '收藏失败了');
                        }
                    } else {
                        // 收藏数加1
                        $scope.chartBook.stats.favorite = true;
                        $scope.chartBook.stats.favCount++;
                    }
                    $scope.favoriteRequesting = false;
                }).error(function(data, status) {
                    if (status === 401) {
                        loginConfirm('请先登录后再收藏图册');
                    } else {
                        toaster.pop('error', '', '出错了，请稍后再试');
                    }
                    $scope.favoriteRequesting = false;
                });
        };

        $scope.removeFavorite = function() {
            if ($scope.favoriteRequesting) {
                return;
            }
            $scope.favoriteRequesting = true;
            $http.delete(charts_server + '/service/social/favorite/' + $scope.currentChartBookId)
                .success(function(response) {
                    if (response.error) {
                        var errorCode = response.error.c;
                        if (errorCode === 'BOOKS-102') {
                            // 还没有收藏
                            $scope.chartBook.stats.favorite = false;
                        } else {
                            toaster.pop('error', '', '取消收藏失败');
                        }
                    } else {
                        // 收藏数减1
                        $scope.chartBook.stats.favorite = false;
                        $scope.chartBook.stats.favCount--;
                    }
                    $scope.favoriteRequesting = false;
                }).error(function(data, status) {
                    if (status === 401) {
                        loginConfirm('会话超时，请重新登录');
                    } else {
                        toaster.pop('error', '', '出错了，请稍后再试');
                    }
                    $scope.favoriteRequesting = false;
                });
        };

        $scope.userLogin = function() {
            $scope.$parent.userLogin(function() {
                // 重新获取当前用户信息
                $scope.fetchCurrentUserInfo();
            });
        };

        var paginatorOptions = {
            size:"mini",
            numberOfPages: 3,
            bootstrapMajorVersion: 3,
            alignment: "center",
            itemTexts: function (type, page, current) {
                switch (type) {
                    case "first":
                        return "<<";
                    case "prev":
                        return "<";
                    case "next":
                        return ">";
                    case "last":
                        return ">>";
                    case "page":
                        return page;
                }
            },

            tooltipTitles: function (type, page, current) {
                switch (type) {
                    case "first":
                        return "第一页";
                    case "prev":
                        return "前一页";
                    case "next":
                        return "下一页";
                    case "last":
                        return "最后一页";
                    case "page":
                        return "第" + page + '页';
                }
            },

            onPageClicked: function(e, originalEvent, type, page) {
                commentPageNO = page - 1;
                fetchChartBookComments();
            }
        };

}])



