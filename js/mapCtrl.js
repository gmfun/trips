foodApp.controller('mapCtrl', ['$scope', '$http', 'uiGmapGoogleMapApi', function ($scope, $http, uiGmapGoogleMapApi) {


    $scope.trips = [];
    $scope.getTrips = function(){
        var url = "https://hypertrack-api-staging.herokuapp.com/api/v1/gps/?trip_id=" + $scope.trip_id;
        setTrips(url)
        //$http.get("https://hypertrack-api-staging.herokuapp.com/api/v1/gps/?trip_id=" + $scope.trip_id).success(function(data){
        //    console.log(data);
        //    data.results.forEach(function(v, i) {
        //        v.pos = { latitude: v.location.coordinates[1], longitude: v.location.coordinates[0] }
        //        v.events = {
        //            click: function(a, b, c) {
        //                console.log(a, b, c);
        //                //alert()
        //                $scope.selected = c
        //                $scope.selected.show = true
        //            }
        //        }
        //    });
        //    console.log(data.results);
        //    $scope.trips = data.results;
        //    //$scope.map.center = data.results[0].pos
        //    //console.log($scope.map.center);
        //})
    };
    function setTrips (url) {
        $http.get(url).success(function(data){
            console.log(data);
            data.results.forEach(function(v, i) {
                v.pos = { latitude: v.location.coordinates[1], longitude: v.location.coordinates[0] }
                v.events = {
                    click: function(a, b, c) {
                        console.log(a, b, c);
                        //alert()
                        $scope.selected = c
                        $scope.selected.show = true
                    }
                }
            });
            //console.log(data.results);
            $scope.trips = $scope.trips.concat(data.results);
            if(data.next) {
                setTrips(data.next)
            }
            //$scope.map.center = data.results[0].pos
            //console.log($scope.map.center);
        })
        //console.log(data.results);
        //$scope.trips = $scope.trips.concat();

    }
    //$scope.selected = {};
    $scope.map = {
        center: { latitude: 19.1968401, longitude: 72.8710581 }, //initial center of map
        zoom: 16
    };

}]);