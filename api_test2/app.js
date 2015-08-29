var origin;
var destination;
var get_destination;
var recieve_destination;
var trip;
var markers = [];
var points = [];
var courier;
var order;
var map;
var destination_changed = false;
var trip_started = false;
var move;
//var directionsService = new google.maps.DirectionsService;
//var directionsDisplay = new google.maps.DirectionsRenderer;
function initMap() {
    $("#start").hide()
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {lat: 19.10959857536918, lng: 72.90787946535647}
    });
    // destination;
    google.maps.event.addListener(map, 'click', function(event) {
        console.log(destination, order);
        if(destination && order){
            if(trip_started){
                var conf = confirm("Do you want to change the destination")
                if(conf){
                    destination.setPosition(event.latLng);
                    destination.setMap(map);
                    console.log(destination);
                    destination_changed = true;
                    //console.log("change destination of id " + recieve_destination.id);
                    patchDestination(recieve_destination.id, event.latLng);
                    //$("#start").click();
                    clearTimeout(move);
                    calculateAndDisplayRoute(directionsService, directionsDisplay);
                }
            }
            else {
                $("#info").hide();
                $("#start").show();
                if(origin || trip_started) {

                }else {
                    origin = new google.maps.Marker({
                        position: event.latLng,
                        map: map
                    });
                }


                destination.setMap(map)
            }

        }
        else{
            alert("Select destination and courier")
        }
        //console.log(get_destination);
        //destination =  new google.maps.Marker({
        //    position: get_destination,
        //    map: map
        //});
        //console.log(destination, origin);
        //var set = "origin";
        //if(set == "origin") {
        //    placeOrigin(event.latLng);
        //    console.log(get_destination, event.latLng);
        //
        //    placeDestination(get_destination)
        //    $("#destination").prop('checked', true)
        //}
        //if(set == "destination") {
        //    placeDestination(event.latLng);
        //}

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
        trip_started = true;
        console.log(order);
        var latlong = origin.getPosition();
        var date = new Date;
        var obj = {
            "start_location": {
                "type": "Point",
                "coordinates": [latlong.K, latlong.G]
            },
            "started_at": date.toISOString(),
            "courier_id": courier,
            "orders": [order]
        };
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
                $("#trip-id").html("Trip_id: "+ data.id );
                $("#order-id").html("order_id: "+ order );
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            }
        });
    }
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    //destination.setPosition(get_destination)
    //console.log(destination.getPosition(), "destin");
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
    console.log(destination_changed, "dest_change");
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
            //origin.setTitle(i+"/"+data_array.length);
            //origin.setLabel(""+i+"/")
        }

    });
    //if(destination_changed) {
    //    var directionsService = new google.maps.DirectionsService;
    //    var directionsDisplay = new google.maps.DirectionsRenderer;
    //    calculateAndDisplayRoute(directionsService, directionsDisplay);
    //    destination_changed = false;
    //}
    //else {
    //}
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
            "coordinates": [array[0].K, array[0].G]
        },
        "trip_id": trip.id,
        "location_accuracy": 5,
        "speed": 4,
        "bearing": 60
    };
    if(destination_changed){
        postGps(obj, array[0]);
        destination_changed = false;
    }

    run();
    function run () {
        //console.log(destination_changed, "change");
        //if(destination_changed) {
        //    var directionsService = new google.maps.DirectionsService;
        //    var directionsDisplay = new google.maps.DirectionsRenderer;
        //    destination.setPosition(get_destination);
        //    destination.setMap(map);
        //    console.log(destination);
        //    destination_changed = false;
        //    $("#start").click();
        //    //calculateAndDisplayRoute(directionsService, directionsDisplay);
        //    //destination_changed = false;
        //    //resetToMove();
        //    //current_i = 0
        //}
        //else {
        //    move = setTimeout( repeat2, 5000)
        //}
        move = setTimeout( repeat2, 5000)
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
        if($("#speed").val()){
            to_move = $("#speed").val() * 0.277778 * 5;
        }else {
            to_move = 200;
        }
        //to_move = $("#speed").val() ? $("#speed").val() * 0.277778 * 5 || 200
    }

    function checkDistance() {
        next_i = google.maps.geometry.spherical.computeDistanceBetween(current_location, array[current_i+1]); // distance between current_location, data_array(current_i+1)
        console.log(to_move <= next_i);
        return to_move <= next_i
    }
}

function patchDestination(id, latlng) {
    console.log(id, latlng);
    var obj = {
        "location": {
            "type": "Point",
            "coordinates": [latlng.K, latlng.G]
        }
    }
    $.ajax({
        type: "PATCH",
        url: "https://hypertrack-api-staging.herokuapp.com/api/v1/destinations/" + id + "/",
        data: JSON.stringify(obj),
        xhr: function() {
            return window.XMLHttpRequest == null || new window.XMLHttpRequest().addEventListener == null
                ? new window.ActiveXObject("Microsoft.XMLHTTP")
                : $.ajaxSettings.xhr();
        },
        contentType:"application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            //origin.setPosition(current);
            ////origin.setTitle(i+"/"+data_array.length);
            ////origin.setLabel(""+i+"/")
        }

    });
}