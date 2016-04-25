var app = angular.module('meanMapApp', ['geolocation']);

// Creates the addCtrl Module and Controller. Note that it depends on the 'geolocation' module and service.
// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
app.factory('gservice', function($rootScope, $http){

        var googleMapService = {};
        	googleMapService.clickLat  = 0;
			googleMapService.clickLong = 0;

        // Array of locations obtained from API calls
        var locations = [];

        // Selected Location (initialize to center of America)
        var selectedLat = -33.4992694;
        var selectedLong = -70.6135418;
        
        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Function will take new latitude and longitude coordinates.
        googleMapService.refresh = function(latitude, longitude){

            // Clears the holding array of locations
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;

            // Perform an AJAX call to get all of the records in the db.
            $http.get('/users').success(function(response){

                // Convert the results into Google Map Format
                locations = convertToMapPoints(response);

                // Then initialize the map.
                initialize(latitude, longitude);
            }).error(function(){});
        };

        // Private Inner Functions
        // --------------------------------------------------------------
        // Convert a JSON of users into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
                var user = response[i];

                // Create popup windows for each record
                var  contentString =
                    '<p><b>Username</b>: ' + user.username +
                    '<br><b>Products</b>: ' + user.products +
                    '<br><b>Price</b>: ' + user.price +
                    '<br><b>Phone</b>: ' + user.phone +
                    '<br><b>Place</b>: ' + user.place +
                    '<br><b>Duration</b>: ' + user.duration +
                    '</p>';

                // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
                locations.push({
                    latlon: new google.maps.LatLng(parseFloat(user.location[1]), parseFloat(user.location[0])),
                    message: new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
                    }),
                    username: user.username,
                    products: user.products,
                    price: user.price,
                    phone: user.phone,
                    place: user.place,
                    duration: user.duration
            });
        }
        // location is now an array populated with records in Google Maps format
        return locations;
    };

// Initializes the map
	var initialize = function(latitude, longitude) {

	    // Uses the selected lat, long as starting point
	    var myLatLng = {lat: parseFloat(selectedLat), lng: parseFloat(selectedLong)};

	    // If map has not been created already...
	    if (!map){

	        // Create a new map and place in the index.html page
	        var map = new google.maps.Map(document.getElementById('map'), {
	            zoom: 80,
	            mapTypeId: google.maps.MapTypeId.HYBRID,
	            center: myLatLng
	        });
	    }

	    // Loop through each location in the array and place a marker
	    locations.forEach(function(n, i){
	        var marker = new google.maps.Marker({
	            position: n.latlon,
	            map: map,
	            title: "Big Map",
	            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
	        });

	        // For each marker created, add a listener that checks for clicks
	        google.maps.event.addListener(marker, 'click', function(e){

	            // When clicked, open the selected marker's message
	            currentSelectedMarker = n;
	            n.message.open(map, marker);
	        });
	    });

	    // Set initial location as a bouncing red marker
	    var initialLocation = new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude));
	    var marker = new google.maps.Marker({
	        position: initialLocation,
	        animation: google.maps.Animation.BOUNCE,
	        map: map,
	        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
	    });
	    lastMarker = marker;

	    	// Clicking on the Map moves the bouncing red marker
		google.maps.event.addListener(map, 'click', function(e){
		    var marker = new google.maps.Marker({
		        position: e.latLng,
		        animation: google.maps.Animation.BOUNCE,
		        map: map,
		        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
		    });

		    // When a new spot is selected, delete the old red bouncing marker
		    if(lastMarker){
		        lastMarker.setMap(null);
		    }

		    // Create a new red bouncing marker and move to it
		    lastMarker = marker;
		    map.panTo(marker.position);

		    googleMapService.clickLat = marker.getPosition().lat();
			googleMapService.clickLong = marker.getPosition().lng();
			$rootScope.$broadcast("clicked");
		});

	};

	    // Refresh the page upon window load. Use the initial latitude and longitude
    google.maps.event.addDomListener(window, 'load',
        googleMapService.refresh(selectedLat, selectedLong));

    return googleMapService;
});

app.controller('addCtrl',['$scope','$http', '$rootScope','gservice', 'geolocation',function($scope, $http, $rootScope, gservice, geolocation){
    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;


    // Set initial coordinates to the center of the US
    $scope.formData.latitude = -33.4992694,
    $scope.formData.longitude = -70.6135418;
    // Get coordinates based on mouse click. When a click event is detected....

	$rootScope.$on("clicked", function(){

	    // Run the gservice functions associated with identifying coordinates
	    $scope.$apply(function(){
	        $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(20);
	        $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(20);
	        $scope.formData.htmlverified = "Nope (Thanks for spamming my map...)";
	    });
	});
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
            place: $scope.formData.place,
            duration: $scope.formData.duration
        };

        // Saves the user data to the db
        $http.post('/users', userData)
            .success(function (data) {
                // Refresh after add New User
                gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
                // Once complete, clear the form (except location)
                $scope.formData.username = "";
                $scope.formData.products = "";
                $scope.formData.price = "";
                $scope.formData.phone = "";
                $scope.formData.place = "";
                $scope.formData.duration = "";
                
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };
}]);