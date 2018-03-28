/**
 * 最高层控制器
 */
let appController = new AppController();;
$(document).ready(function() {
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

    function innerClass() {};
    innerClass.prototype = AppController.prototype;

    innerClass.prototype.init = function() {
        locationManager = new LocationManager();
        mapViewController = new MapViewController();
        initLocationManager();

        $("#search-input").keyup(function(event) {
            if (event.which == 13) { //回车键筛选
                $('#filter-btn').click();
            }
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

    innerClass.prototype.initMap = function() {
        $('#filter-btn').click();
    };

    /**
     * 筛选处理
     * @param {*} search 
     */
    innerClass.prototype.onFilter = function(search) {
        let result = locationManager.query(search);
        listViewModel.renderData(result);
        mapViewController.renderData(result);
    };

    /**
     * 地点选中处理
     * @param {*} location 
     */
    innerClass.prototype.onSelectItem = function(location) {
        mapViewController.selectMarker(location);
    };

    /**
     * 初始化数据
     */
    function initLocationManager() {

        locationManager.add({
            title: 'Park Ave Penthouse',
            location: {
                lat: 40.7713024,
                lng: -73.9632393
            }
        }).add({
            title: 'Chelsea Loft',
            location: {
                lat: 40.7444883,
                lng: -73.9949465
            }
        }).add({
            title: 'Union Square Open Floor Plan',
            location: {
                lat: 40.7347062,
                lng: -73.9895759
            }
        }).add({
            title: 'East Village Hip Studio',
            location: {
                lat: 40.7281777,
                lng: -73.984377
            }
        }).add({
            title: 'TriBeCa Artsy Bachelor Pad',
            location: {
                lat: 40.7195264,
                lng: -74.0089934
            }
        }).add({
            title: 'Chinatown Homey Space',
            location: {
                lat: 40.7180628,
                lng: -73.9961237
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
    this.renderData = function(datas) {
        this.locations(datas);
    };

    this.clickItem = function() {
        appController.onSelectItem(this);
    };
}

/**
 * 筛选空间控制器
 */
function FilterControl() {
    this.searchText = ko.observable('');
    this.filter = function() {
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


    function innerClass() {};
    innerClass.prototype = MapViewController.prototype;

    innerClass.prototype.renderData = function(locations) {
        if (map == null) {
            this.init();
        }
        hideListings();
        markers = [];

        for (var i = 0; i < locations.length; i++) {

            let position = locations[i].location;
            let title = locations[i].title;

            let marker = new google.maps.Marker({
                position: position,
                title: title,
                map: map,
                animation: google.maps.Animation.DROP,
                id: i
            });

            markers.push(marker);

            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfowindow);
            });
        }

        showListings();

    };

    innerClass.prototype.init = function() {
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

    innerClass.prototype.selectMarker = function(location) {

        for (let i = 0; i < markers.length; i++) {
            let marker = markers[i];
            if (marker.getTitle() == location.title) {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() { //跳动1秒后取消动画
                    marker.setAnimation(null);
                }, 1000);
                break;
            }
        }
    };


    function populateInfoWindow(marker, infowindow) {

        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
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

    function innerlocationManager() {};

    innerlocationManager.prototype = LocationManager.prototype;

    innerlocationManager.prototype.add = function(location) {
        locations.push(location);
        return this;
    };

    innerlocationManager.prototype.getById = function(id) {
        let result = null;
        locations.forEach(function(currentValue, index, array) {
            if (currentValue.id === id) {
                result = currentValue;
            }
        });
    }

    innerlocationManager.prototype.delete = function(id) {
        locations.forEach(function(currentValue, index, array) {
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
    innerlocationManager.prototype.query = function(search) {
        if (search == null) {
            search = '';
        }
        let conditon = search.replace(/(^\s*)|(\s*$)/g, "").toLowerCase();

        let results = [];
        locations.forEach(function(currentValue, index, array) {
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