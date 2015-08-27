angular.module("test", []).controller("controlCtrl", ["$http", "$scope", function ($http, $scope) {
    $http.get("https://hypertrack-api-staging.herokuapp.com/api/v1/destinations/").success(function(data){
        $scope.destinations  = data.results

    });
    $http.get("https://hypertrack-api-staging.herokuapp.com/api/v1/couriers/").success(function(data){
        $scope.couriers = data.results;

        console.log($scope.couriers);
    });
    $scope.$watch('destination', function(current, old) {
        if(current){
            console.log(current);
            get_destination = new google.maps.LatLng(current.location.coordinates[1], current.location.coordinates[0]);
            if(destination){
                destination.setPosition(get_destination)
            }
            else {
                destination = new google.maps.Marker({
                    position: get_destination,
                    map: map
                })
                console.log(destination);
            }

            //get_destination = current
            $http.post("https://hypertrack-api-staging.herokuapp.com/api/v1/orders/", {destination_id: current.id}).success(function(data) {
                $scope.order = data;
                console.log(data.id);
                order = data.id
            });
        }
    });
    $scope.$watch('courier', function (current, old)  {
        if(current) {
            courier = current.id
        }
    })

}]);