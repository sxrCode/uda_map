let appController;
$(document).ready(function () {
    appController = new AppController();
    appController.init();
});

function initMap() {
    appController.initMap();
}

function AppController() {
    let listViewController;
    let locationManager;
    let mapViewController;

    let filterControl;

    function innerClass() { };
    innerClass.prototype = AppController.prototype;

    innerClass.prototype.init = function () {
        listViewController = new ListViewController();
        locationManager = new LocationManager();
        mapViewController = new MapViewController();
        initLocationManager();
        let result = locationManager.query('');
        listViewController.renderData(result);

        $("#search-input").keyup(function (event) {
            console.log("input: " + event.which);
            if (event.which == 13) { //回车键
                $('#filter-btn').click();
            }
        });

        $('#filter-btn').click(function () {
            let search = $('#search-input').val();
            let result = locationManager.query(search);
            listViewController.renderData(result);
            mapViewController.renderData(result);
        });
    }

    innerClass.prototype.initMap = function () {
        $('#filter-btn').click();
    };

    innerClass.prototype.onSelectItem = function (location) {
        mapViewController.selectMarker(location);
    };

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
}




function ListViewController() {

    let listContainer = document.getElementById('list-container');

    function innerClass() { };
    innerClass.prototype = ListViewController.prototype;

    innerClass.prototype.renderData = function (datas) {
        if (datas && datas.length) {
            let i = 0;
            $(listContainer).html('');
            for (i = 0; i < datas.length; i++) {
                let location = datas[i];
                let item = $('<div class="list-item">Ashby</div>');
                $(item).html(location.title);
                $(item).click(function () {
                    appController.onSelectItem(location);
                });
                $(listContainer).append(item);
            }
        }

    };

    return new innerClass();
}

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

        for (var i = 0; i < locations.length; i++) {
            // Get the position from the location array.
            let position = locations[i].location;
            let title = locations[i].title;
            // Create a marker per location, and put into markers array.
            let marker = new google.maps.Marker({
                position: position,
                title: title,
                map: map,
                animation: google.maps.Animation.DROP,
                id: i
            });
            // Push the marker to our array of markers.
            markers.push(marker);
            // Create an onclick event to open an infowindow at each marker.
            marker.addListener('click', function () {
                populateInfoWindow(this, largeInfowindow);
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
                setTimeout(function () {
                    marker.setAnimation(null);
                }, 1000);
                break;
            }
        }
    };

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    }

    // This function will loop through the markers array and display them all.
    function showListings() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }

    // This function will loop through the listings and hide them all.
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

function deepClone(obj) {
    var newObj = obj instanceof Array ? [] : {};
    for (var i in obj) {
        newObj[i] = typeof obj[i] == 'object' ?
            deepClone(obj[i]) : obj[i];
    }
    return newObj;
}