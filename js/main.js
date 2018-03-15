
var map;
function initMap() {
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413549,
            lng: -73.99802439999996
        },
        zoom: 8
    });

    var tribeca = {
        lat: 40.7413549,
        lng: -74.99802439999996
    };

    var marker = new google.maps.Marker({ position: tribeca, map: map, title: 'first marker' });
}