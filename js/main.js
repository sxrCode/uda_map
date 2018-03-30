/**
 * 最高层控制器
 */
let appController = new AppController();;
$(document).ready(function () {
    appController.init();
});

/**
 * 地图API加载成功回调
 */
function initMap() {
    appController.initMap();
}

/**
 * 地图加载错误提示
 */
function onLoadFail() {
    let errorTip = $('<div class="tip-box">地图API加载出错！</div>');
    $('div.container').append(errorTip);
}

function AppController() {
    let listViewModel;
    let locationManager;
    let mapViewController;

    let filterControl;

    function innerClass() { };
    innerClass.prototype = AppController.prototype;

    innerClass.prototype.init = function () {
        locationManager = new LocationManager();
        mapViewController = new MapViewController();
        initLocationManager();

        $("#search-input").keyup(function (event) {
            if (event.which == 13) { //回车键筛选
                $('#filter-btn').click();
            }
        });

        $("#hb-icon").click(function () {
            let box = $("div.options-box")[0];
            $(box).toggleClass('hide');
        });

        let result = locationManager.query('');
        listViewModel = new ListViewModel(result);

        ko.applyBindings(
            listViewModel, document.getElementById('list-container')
        );

        ko.applyBindings(
            new FilterControl(), document.getElementById('filter-control')
        );
    }

    innerClass.prototype.initMap = function () {
        $('#filter-btn').click();
    };

    /**
     * 筛选处理
     * @param {*} search 
     */
    innerClass.prototype.onFilter = function (search) {
        let result = locationManager.query(search);
        listViewModel.renderData(result);
        mapViewController.renderData(result);
    };

    /**
     * 地点选中处理
     * @param {*} location 
     */
    innerClass.prototype.onSelectItem = function (location) {
        mapViewController.selectMarker(location);
    };

    /**
     * 初始化数据
     */
    function initLocationManager() {

        locationManager.add({
            title: '北京大学',
            id: 'B000A816R6',
            location: {
                lat: 116.31088,
                lng: 39.99281
            }
        }).add({
            title: '清华大学',
            id: 'B000A7BD6C',
            location: {
                lat: 116.326836,
                lng: 40.00366
            }
        }).add({
            title: '对外经济贸易大学',
            id: 'B000A7C66K',
            location: {
                lat: 116.427721,
                lng: 39.980381
            }
        }).add({
            title: '北京航空航天大学',
            id: 'B000A830XU',
            location: {
                lat: 116.347313,
                lng: 39.981771
            }
        }).add({
            title: '北京师范大学',
            id: 'B000A83JHK',
            location: {
                lat: 116.365798,
                lng: 39.961576
            }
        }).add({
            title: '中央戏剧学院',
            id: 'B000A81FPJ',
            location: {
                lat: 116.403983,
                lng: 39.935663
            }
        });

    }

    return new innerClass();
}

/**
 * 地点列表控制器
 * @param {*} locations 
 */
function ListViewModel(locations) {
    this.locations = ko.observableArray(locations);
    this.renderData = function (datas) {
        this.locations(datas);
    };

    this.clickItem = function () {
        appController.onSelectItem(this);
    };
}

/**
 * 筛选空间控制器
 */
function FilterControl() {
    this.searchText = ko.observable('');
    this.filter = function () {
        let search = this.searchText();
        console.log('search: ' + search);
        appController.onFilter(search);

    }.bind(this);
}

/**
 * 地图控制器
 */
function MapViewController() {

    var map;
    var markers = [];
    var largeInfowindow = null;


    function innerClass() { };
    innerClass.prototype = MapViewController.prototype;

    innerClass.prototype.renderData = function (locations) {
        if (map == null) {
            this.init();
        }
        hideListings();
        markers = [];

        for (let i = 0; i < locations.length; i++) {

            let position = locations[i].location;
            let title = locations[i].title;

            let marker = new google.maps.Marker({
                position: position,
                title: title,
                map: map,
                animation: google.maps.Animation.DROP,
                id: locations[i].id
            });

            markers.push(marker);

            marker.addListener('click', function () {
                $.ajax({
                    url: "http://restapi.amap.com/v3/place/detail?key=69fab4e7412af193e13a36a7878a76bb&extensions=all&id=" + locations[i].id,
                    async: true,
                    success: function (data, textStatus, jqXHR) {
                        if (data.pois.length > 0) {
                            let poiInfo = data.pois[0];
                            let content = template('tpl-info', poiInfo);
                            populateInfoWindow(marker, content);
                        }
                        //console.log(data.pois);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        let content = '<div>信息获取失败！</div>';
                        populateInfoWindow(marker, content);
                    },
                });

            });
        }

        showListings();

    };

    innerClass.prototype.init = function () {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 40.7281777,
                lng: -73.9980244
            },
            zoom: 13,
            mapTypeControl: false
        });

        largeInfowindow = new google.maps.InfoWindow();
    }

    innerClass.prototype.selectMarker = function (location) {
        for (let i = 0; i < markers.length; i++) {
            let marker = markers[i];
            if (marker.getTitle() == location.title) {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () { //跳动1秒后取消动画
                    marker.setAnimation(null);
                }, 1000);
                break;
            }
        }
    };


    function populateInfoWindow(marker, content) {
        let infowindow = largeInfowindow;
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent(content);
            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    }


    function showListings() {
        var bounds = new google.maps.LatLngBounds();

        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }


    function hideListings() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    return new innerClass();
}

function LocationManager() {
    var locations = [];

    function innerlocationManager() { };

    innerlocationManager.prototype = LocationManager.prototype;

    innerlocationManager.prototype.add = function (location) {
        locations.push(location);
        return this;
    };

    innerlocationManager.prototype.getById = function (id) {
        let result = null;
        locations.forEach(function (currentValue, index, array) {
            if (currentValue.id === id) {
                result = currentValue;
            }
        });
    }

    innerlocationManager.prototype.delete = function (id) {
        locations.forEach(function (currentValue, index, array) {
            if (currentValue.id === id) {
                array.splice(index, 1);
            }
        });
        return result;
    }

    /**
     * 查询数据
     * @param {查询条件} search 
     */
    innerlocationManager.prototype.query = function (search) {
        if (search == null) {
            search = '';
        }
        let conditon = search.replace(/(^\s*)|(\s*$)/g, "").toLowerCase();

        let results = [];
        locations.forEach(function (currentValue, index, array) {
            let title = currentValue.title.toLowerCase();
            if (title.indexOf(conditon) != -1) {
                results.push(deepClone(currentValue));
            }
        });

        return results;
    };

    return new innerlocationManager();
}

/**
 * 深拷贝
 * @param {} obj 
 */
function deepClone(obj) {
    var newObj = obj instanceof Array ? [] : {};
    for (var i in obj) {
        newObj[i] = typeof obj[i] == 'object' ?
            deepClone(obj[i]) : obj[i];
    }
    return newObj;
}