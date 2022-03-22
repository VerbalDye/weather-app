// Weather app API Key 5838f87b9522f7208b3164e51a6e18e8
// Other geocoding API key a3952689065efd3f68b8527f047a37cb


var addressFormEl = document.querySelector("#address-search");
var addressInputEl = document.querySelector("#address-input");

var getGeocode = function (event) {
    event.preventDefault();

    var searchTerm = addressInputEl.value.trim().replaceAll(" ", "%20");
    addressInputEl.value = "";

    var geoCodingApi = "http://api.positionstack.com/v1/forward?access_key=a3952689065efd3f68b8527f047a37cb&query=" + searchTerm;

    fetch(geoCodingApi).then(function (response) {
        response.json().then(function (data) {
            if (response.ok) {
                console.log(data);
                var currentCity = data.data[0];
                getWeather(currentCity.latitude, currentCity.longitude);
            }
        })
    }).catch(function (error) {
        alert("Search failed. Could not connect to location services. " + error);
    })
}

var getWeather = function (lat, lon) {
    var weatherApi = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=5838f87b9522f7208b3164e51a6e18e8";
    fetch(weatherApi).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data);
            })
        }
    }).catch(function (error) {
        alert("Search failed. Could not connect to weather services. " + error);
    })
}

addressFormEl.addEventListener("submit", getGeocode);