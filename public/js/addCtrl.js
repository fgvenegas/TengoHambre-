var addCtrl = angular.module('addCtrl', ['geolocation', 'gservice']);
addCtrl.controller('addCtrl', function($scope, $http, geolocation, gservice){
    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;

    // Set initial coordinates to the center of the US
    $scope.formData.latitude = 33.4992694,
    $scope.formData.longitude = -70.6135418;

    // Functions
    // ----------------------------------------------------------------------------
    // Creates a new user based on the form fields
    $scope.createUser = function() {

        // Grabs all of the text box fields
        var userData = {
            username: $scope.formData.username,
            products: $scope.formData.products,
            price: $scope.formData.price,
            phone: $scope.formData.phone,
            location: [$scope.formData.longitude, $scope.formData.latitude],
            duration: $scope.formData.duration
        };

        // Saves the user data to the db
        $http.post('/users', userData)
            .success(function (data) {
                // Refresh after add New User
                //gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
                // Once complete, clear the form (except location)
                $scope.formData.username = "";
                $scope.formData.products = "";
                $scope.formData.price = "";
                $scope.formData.phone = "";
                $scope.formData.duration = "";
                
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };
});