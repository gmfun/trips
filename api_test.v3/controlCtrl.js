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
            $http.post("https://hypertrack-api-staging.herokuapp.com/api/v1/orders/", {destination_id: current}).success(function(data) {
                $scope.order = data.results;
            });
        }
    });
    $scope.startTrip = function () {
        if($scope.courier && $scope.destination){

        }
    };

}]);