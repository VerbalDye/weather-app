// Weather app API Key 5838f87b9522f7208b3164e51a6e18e8
// Other geocoding API key a3952689065efd3f68b8527f047a37cb

// getting elements for later
var addressFormEl = document.querySelector("#address-search");
var addressInputEl = document.querySelector("#address-input");
var cityHeaderEl = document.querySelector("#city-header");
var recentEl = document.querySelector("#recent");
var currentWeatherEl = document.querySelector("#current-weather ul");

// creates the recents array and variable
if (localStorage.getItem("recents")) {
    var recents = JSON.parse(localStorage.getItem("recents"));
} else {
    var recents = [];
    localStorage.setItem("recents", JSON.stringify(recents));
};

// turns city, state, address, or zip into coordinates
var getGeocode = function (event) {
    event.preventDefault();

    // replaces spaces with the %20 space character
    var searchTerm = addressInputEl.value.trim().replaceAll(" ", "%20");
    addressInputEl.value = "";

    // defines the geoCode API URL
    var geoCodingApi = "http://api.positionstack.com/v1/forward?access_key=a3952689065efd3f68b8527f047a37cb&query=" + searchTerm;

    // calls the API
    fetch(geoCodingApi).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data.data);

                // checks if the API returned any data
                if (data.data.length > 0) {

                    // defines the nested object arrays as currentCity
                    var currentCity = data.data[0];

                    updateLocation(currentCity);

                    // calls getWeather with the returned Latitude and Longitude
                    getWeather(currentCity.latitude, currentCity.longitude);
                } else {
                    alert("No results found. Please type a valid location");
                }
            })
        } else {
            alert("No results found. Please type a valid location");
        }
        // catches a critcal failure and lets the user know
    }).catch(function (error) {
        alert("Search failed. Could not connect to location services. \n" + error);
    });
}

// get all the weather data for a location
var getWeather = function (lat, lon) {

    // defines api address
    var weatherApi = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=5838f87b9522f7208b3164e51a6e18e8";

    // calls the api
    fetch(weatherApi).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                populuteWeather(data);
            })
        } else {
            alert("Something went wrong. \n" + response.status + ": " + response.statusText);
        }
        // catches a critcal failure and lets the user know
    }).catch(function (error) {
        alert("Search failed. Could not connect to weather services. \n" + error);
    })
}

var populuteWeather = function (data) {
    console.log(data);
    currentWeatherEl.textContent = "";

    var listEl = document.createElement("li");
    listEl.textContent = "Temp: " + data.current.temp + "°F";
    currentWeatherEl.appendChild(listEl);

    var listEl = document.createElement("li");
    listEl.textContent = "Wind: " + data.current.wind_speed + "MPH " + getWindDirection(data.current.wind_deg);
    currentWeatherEl.appendChild(listEl);

    var listEl = document.createElement("li");
    listEl.textContent = "Humidity: " + data.current.humidity;
    currentWeatherEl.appendChild(listEl);

    var listEl = document.createElement("li");
    listEl.innerHTML = "UV Index: <span>" + data.current.uvi + "</span>";
    currentWeatherEl.appendChild(listEl);
}

var updateLocation = function (currentCity) {
    var cityName = currentCity.locality + ", " + currentCity.region_code + ", " + currentCity.country_code
    var now = dayjs().format("MM/DD/YYYY");
    cityHeaderEl.textContent = currentCity.locality + " - " + now;

    for (var i = 0; i < recents.length; i++) {
        if (recents[i].name == cityName) {
            return;
        }
    }

    recents.push({
        name: cityName,
        lat: currentCity.latitude,
        lon: currentCity.longitude
    });
    localStorage.setItem("recents", JSON.stringify(recents));
    getRecents();
}

var getRecents = function () {
    recentEl.textContent = "";

    for (var i = 0; i < recents.length; i++) {
        var buttonEl = document.createElement("button");
        buttonEl.textContent = recents[i].name;
        buttonEl.classList = "btn btn-recent mt-3 p-2 w-100";
        buttonEl.setAttribute("data-index", i);

        recentEl.appendChild(buttonEl);
    }
};

var repeatSearch = function (event) {
    var index = event.target.getAttribute("data-index");
    getWeather(recents[index].lat, recents[index].lon);
    var now = dayjs().format("MM/DD/YYYY");
    cityHeaderEl.textContent = recents[index].name.split(",")[0] + " - " +now;
}

var getWindDirection = function (deg) {
    var directionNum = Math.round((deg / 45));
    var direction = ""
    switch (directionNum) {
        case 0:
            direction = "N";
            break;
        case 1:
            direction = "NE";
            break;
        case 2:
            direction = "E";
            break;
        case 3:
            direction = "SE";
            break;
        case 4:
            direction = "S";
            break;
        case 5:
            direction = "SW";
            break;
        case 6:
            direction = "W";
            break;
        case 7:
            direction = "NW";
            break;
        case 8:
            direction = "N";
    }
    return direction;
}

getRecents();

// listens for a submit event on the search box
addressFormEl.addEventListener("submit", getGeocode);

// listens for a click to the a recent button
recentEl.addEventListener("click", repeatSearch);