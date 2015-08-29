var map;
var poly1 = null;
var poly2;
function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lat: 19.10959857536918, lng: 72.90787946535647}
    })
    $("#start").click(add)
    var which_poly = 1;
    function add(){
        var poly_path = [];
        var poly_array = JSON.parse($("#polyline").val()) ;
        $("#polyline").val("")
        console.log(poly_array);
        map.setCenter({
            lat: poly_array[0][1],
            lng: poly_array[0][0]
        })
        poly_array.forEach(function(v, i) {
            poly_path.push({lat: v[1], lng: v[0]})
        });
        if(which_poly==1){
            which_poly = 2;
            //console.log($("#polyline").val());

            if(poly1){
                poly1.setPath(poly_path)
            }
            else {
                poly1 = new google.maps.Polyline({
                    path: poly_path,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1,
                    strokeWeight: 2,
                    map: map
                })
                //poly1.setMap(map)
            }

        }else {
            which_poly=1;
            if(poly2){
                poly2.setPath(poly_path)
            }
            else {
                poly1 = new google.maps.Polyline({
                    path: poly_path,
                    strokeColor: '#1A20B3',
                    strokeOpacity: 1,
                    strokeWeight: 2,
                    map: map
                })
            }

        }

    }
}