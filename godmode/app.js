angular.module("godmode", []);
BASE_URL = "https://hypertrack-api-staging.herokuapp.com/api/v1/";

var map;
var data_array;
var marker;
var fps = 100;
var position;
var next;
var poly;
var trip_id
function initMap(){

    var origin = {lat: 19.10959857536918, lng: 72.90787946535647};
    var origin = {lat: 19.196858232658, lng: 72.8672843335952};

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: origin
    });

    marker = new google.maps.Marker({
        position: origin,
        map: map,
        title: 'Hello World!'
    });
    var url = "/gps/filtered/?trip_id=257";
    $("#start").click(click);
    function click() {
        trip_id = $("#trip_id").val();
        console.log(trip_id);
        $.ajax({
            type: "GET",
            url: BASE_URL + "gps/filtered/?trip_id=" + trip_id,
            contentType:"application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                console.log(data);
                //var now = new Date().toISOString();
                //data.results.forEach(function(v, i){
                //    v.created_at =  now;
                //});
                //data_array = Object.create(data.results);
                next = data.next;
                data_array = data.results;
                map.setCenter({lat: data_array[0].location.coordinates[1], lng: data_array[0].location.coordinates[0]});
                var polyarray = [];
                data.results.forEach(function(v, i) {
                    polyarray.push({lat: v.location.coordinates[1], lng: v.location.coordinates[0]})

                });
                poly = new google.maps.Polyline({
                    path: polyarray,
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.5,
                    strokeWeight: 2
                });
                poly.setMap(map);
                startAnmination();
                fillArray(data_array[data_array.length-1].created_at)
            }
        });
    }
    function startAnmination(){
        var start_time = new Date(),
            current_index = 0,
            timestamp = start_time.getTime();
        var current_position = data_array[0];
        var current_keyframe;
        var to_move;
        resetToMove();
        current_keyframe = {
            position: current_position.location.coordinates,
            index: current_index,
            time: current_position.created_at
        };
        position = new google.maps.LatLng(current_keyframe.position[1], current_keyframe.position[0]);
        function next_latLng(){
            return new google.maps.LatLng(data_array[current_index+1].location.coordinates[1], data_array[current_index+1].location.coordinates[0]);
        }
        function this_latLng() {
            return new google.maps.LatLng(data_array[current_index].location.coordinates[1], data_array[current_index].location.coordinates[0]);
        }
        draw();
        function draw(){
            //new_marker = google.maps.Marker({
            //    position: position,
            //    map: map
            //});
            marker.setPosition({lat: position.G, lng: position.K });
            //console.log(marker.getPosition());
            var next = setTimeout(repeat, fps)
            //console.log("here");
        }
        function repeat(){
            //console.log(current_index, data_array.length, "repeat");
            if(current_index+1 < data_array.length ) {
                //console.log(position, current_index);
                if(checkDistance()){
                    var heading = google.maps.geometry.spherical.computeHeading(this_latLng(), next_latLng());
                    position = google.maps.geometry.spherical.computeOffset(position, to_move, heading);
                    //position = new google.maps.LatLng(new_position[1], new_position[0]);
                    //marker.setPosition(position);

                    resetToMove();
                    //console.log(data_array[data_array.length - 1], data_array.length - 1, data_array);
                    var last_p = new google.maps.LatLng(data_array[data_array.length-1].location.coordinates[1], data_array[data_array.length-1].location.coordinates[0]);
                    //console.log(google.maps.geometry.spherical.computeDistanceBetween(position, last_p), to_move, "ds", current_index);
                    if(google.maps.geometry.spherical.computeDistanceBetween(position, last_p) > to_move || current_index != data_array.length-1){
                        draw();
                    }
                    else {
                        console.log("here");
                        //var new_pos = data_array[data_array.length-1].location.coordinates;
                        current_index++;
                        position = this_latLng()
                        current_position = data_array[current_index];
                        current_keyframe.position = current_position.location.coordinates;
                        draw();
                    }

                }
                else {
                    to_move = to_move - google.maps.geometry.spherical.computeDistanceBetween(position, next_latLng());
                    current_index++;
                    current_position =  data_array[current_index];
                    repeat();
                }

            }
            else {
                if(next){
                    draw()
                }
            }

        }
        function resetToMove(){
            var start_time = new Date(data_array[current_index].created_at);
            var end_time =  new Date(data_array[current_index+1].created_at);
            var time = end_time.getTime() - start_time.getTime();
            var current_latlng = new google.maps.LatLng(current_position.location.coordinates[1], current_position.location.coordinates[0]);
            //var next_latlng = new google.maps.LatLng(data_array[current_index+1].location.coordinates[1], data_array[current_index+1].location.coordinates[1]);
            var distance = google.maps.geometry.spherical.computeDistanceBetween(this_latLng(), next_latLng());
            var speed = distance / time;
            to_move = speed * fps
            //console.log(to_move, distance, time, speed, "tomove");
            //console.log("things", current_index, to_move);
        }
        function checkDistance() {
            //console.log(data_array, "next");
            var next_p = data_array[current_index+1].location.coordinates;
            //var next_latLng = new google.maps.LatLng(next_p[1], next_p[0]);
            next_i = google.maps.geometry.spherical.computeDistanceBetween(position, next_latLng()); // distance between current_location, data_array(current_i+1)
            //console.log(to_move <= next_i, to_move, next_i);
            return to_move <= next_i
        }

    }

    function fillArray(time){
        this.fill = setTimeout(function () {
            $.ajax({
                type: "GET",
                url: next,
                contentType:"application/json; charset=utf-8",
                dataType: "json",
                success: function(data) {
                    if(data.next != next){
                        data_array.concat(data.results);
                        var polyarray;
                        data.results.forEach(function(v, i) {
                            poly.getPath().push(new google.maps.LatLng(v.location.coordinates[1], v.location.coordinates[0]))
                            //polyarray.push(new google.maps.LatLng(v.location.coordinates[1], v.location.coordinates[0]))
                        })

                    }



                    if(data.next) {
                        next = data.next;
                        fillArray()
                    }else {
                        console.log("clear");
                        //clearInterval(this.fill);
                    }
                    //fillArray(data_array[data_array.length-1])
                }
            });
        },10000)
    }
}