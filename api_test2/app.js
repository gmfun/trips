var origin;
var destination;
var trip;
var markers = [];
var points = [];
function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {lat: 19.1968401, lng: 72.8710581}
    });
    // destination;
    google.maps.event.addListener(map, 'click', function(event) {
        var set = $("#panel").find('input[name=set]:checked').val()
        if(set == "origin") {
            placeOrigin(event.latLng);
            $("#destination").prop('checked', true)
        }
        if(set == "destination") {
            placeDestination(event.latLng);
        }

    });

    function placeOrigin(location) {
        console.log(location);
        if(origin) {
            origin.setPosition(location)
        }else {
            origin = new google.maps.Marker({
                position: location,
                map: map
            });
        }

        console.log(origin.getPosition())
    }
    function placeDestination(location) {
        if(destination) {
            destination.setPosition(location)
        }else {
            destination = new google.maps.Marker({
                position: location,
                map: map
            });
        }

    }
    directionsDisplay.setMap(map);

    var onChangeHandler = function() {
        // console.log(origin.getPosition())
        var latlong = origin.getPosition()
        var date = new Date;
        var obj = {
            "start_location": {
                "type": "Point",
                "coordinates": [latlong.K, latlong.G]
            },
            "started_at": date.toISOString(),
            "courier_id": 2
        }
        postTrip(obj);

    };
    document.getElementById('start').addEventListener('click', onChangeHandler);

    function postTrip(obj){
        $.ajax({
            type: "POST",
            url: "https://hypertrack-api-staging.herokuapp.com/api/v1/trips/",
            data: JSON.stringify(obj),
            contentType:"application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                console.log(data);
                trip = data;
                $("#trip-id").html("Trip_id: "+ data.id);
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            }
        });
    }
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: origin.getPosition(),//document.getElementById('start').value,
        destination: destination.getPosition(), //document.getElementById('end').value,
        travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
        // console.log(response.routes[0].overview_path, "response")

        if (status === google.maps.DirectionsStatus.OK) {
            ping(response.routes[0].overview_path);
            points = response.routes[0].overview_path;
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}
var last =  null;

function postGps(obj, current) {
    if(last)
        console.log(google.maps.geometry.spherical.computeDistanceBetween(current, last));
    last = current
    $.ajax({
        type: "POST",
        url: "https://hypertrack-api-staging.herokuapp.com/api/v1/gps/",
        data: JSON.stringify(obj),
        contentType:"application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            origin.setPosition(current);
            //origin.setTitle(i+"/"+array.length);
            //origin.setLabel(""+i+"/")
        }
    });
}
function ping(array) {
    var to_move;
    var current_i = 0;
    var logs = [];
    var current_location =  array[0];

    resetToMove();
    destination.setMap(null);
    var i = 0;
    var date = new Date;
    var obj = {
        "location": {
            "type": "Point",
            "coordinates": []
        },
        "trip_id": trip.id,
        "location_accuracy": 5,
        "speed": 4,
        "bearing": 60
    };
    run();
    function run () {
        setTimeout( repeat2, 5000)
    }

    function repeat() {
        obj.location.coordinates = [array[i].K, array[i].G];
        console.log(JSON.stringify(obj));
        postGps(obj, array, i);
        i++;
        if(array.length>i+1)
            run()
    }

    function repeat2() {
        if(checkDistance()){
            var heading =  google.maps.geometry.spherical.computeHeading(array[current_i], array[current_i+1]);
            current_location = google.maps.geometry.spherical.computeOffset(current_location, to_move, heading);
            obj.location.coordinates = [current_location.K, current_location.G];
            postGps(obj, current_location);
            resetToMove();
            if(google.maps.geometry.spherical.computeDistanceBetween(current_location, array[array.length-1]) > to_move){
                run()
            }
            else {
                obj.location.coordinates = [array[array.length-1].K, array[array.length-1].G];
                postGps(obj, array[array.length-1])
            }
        }
        else{
            to_move = to_move - google.maps.geometry.spherical.computeDistanceBetween(current_location, array[current_i+1]);
            current_i++;
            current_location =  array[current_i];
            repeat2();
        }
    }

    function resetToMove() {
        to_move = 10;
    }

    function checkDistance() {
        next_i = google.maps.geometry.spherical.computeDistanceBetween(current_location, array[current_i+1]); // distance between current_location, array(current_i+1)
        console.log(to_move <= next_i);
        return to_move <= next_i
    }
}