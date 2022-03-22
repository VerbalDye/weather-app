// Weather app API Key 5838f87b9522f7208b3164e51a6e18e8
// Google Geocoding API key AIzaSyAT0ZG22e9iBmIAKgvR9TX50tHpPTyjpqk
// Other geocoding API key a3952689065efd3f68b8527f047a37cb

var getGeocode = function (cityInput) {
    cityKeyword = cityInput.trim().replaceAll(" ", "%20");
    console.log(cityKeyword);

    var geoCodingApi = "http://api.positionstack.com/v1/forward?access_key=a3952689065efd3f68b8527f047a37cb&query=" + cityKeyword;

    fetch(geoCodingApi).then(function (response) {
        response.json().then(function (data) {
            console.log(data);
            var currentCity = data.data[0];
            getWeather(currentCity.latitude, currentCity.longitude);
        })
    })
}

var getWeather = function (lat, lon) {
    var weatherApi = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly&units=imperial&appid=5838f87b9522f7208b3164e51a6e18e8";
    fetch(weatherApi).then(function (response) {
        response.json().then(function (data) {
            console.log(data);
        })
    })
}

var cityInput = "Akron, OH United States";

getGeocode(cityInput);