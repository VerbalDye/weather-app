// Weather app API Key 5838f87b9522f7208b3164e51a6e18e8
// Other geocoding API key a3952689065efd3f68b8527f047a37cb

// getting elements for later
var addressFormEl = document.querySelector("#address-search");
var addressInputEl = document.querySelector("#address-input");
var cityHeaderEl = document.querySelector("#city-header");
var currentIcon = document.querySelector("#current-icon");
var recentEl = document.querySelector("#recent");
var currentWeatherEl = document.querySelector("#current-weather ul");
var hiddenEl = document.querySelector("#weather-content");
var currentIcon = document.querySelector("#current-icon");

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
    var geoCodingApi = "https://api.positionstack.com/v1/forward?access_key=a3952689065efd3f68b8527f047a37cb&query=" + searchTerm;

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
                hiddenEl.classList.remove("d-none");
                populuteCurrentWeather(data);
                populuteFiveDay(data);
            })
        } else {
            alert("Something went wrong. \n" + response.status + ": " + response.statusText);
        }
        // catches a critcal failure and lets the user know
    }).catch(function (error) {
        alert("Search failed. Could not connect to weather services. \n" + error);
    })
}

var getWeatherIcon = function (iconId, imageEl) {    
    imageEl.src = "http://openweathermap.org/img/wn/" + iconId + ".png";
}

// creates all the elements in the 
var populuteCurrentWeather = function (data) {
    console.log(data);

    // empties out the elements
    currentWeatherEl.textContent = "";


    getWeatherIcon(data.current.weather[0].icon, currentIcon);

    // create the different list elements
    createListElement(currentWeatherEl, "Temp: " + data.current.temp + "°F");
    createListElement(currentWeatherEl, "Wind: " + data.current.wind_speed + "MPH " + getWindDirection(data.current.wind_deg));
    createListElement(currentWeatherEl, "Humidity: " + data.current.humidity + "%");
    createListElement(currentWeatherEl, 'UV Index: <span style="background:' + getUV(data.current.uvi) + ';">' + data.current.uvi + '</span>');
}

var populuteFiveDay = function (data) {

    for (var i = 0; i < 5; i++) {
        var dayListEl = document.querySelector("#day-" + i + " ul");
        var dayheaderEl = document.querySelector("#day-" + i + " h4")
        dayListEl.textContent = "";
        var now = dayjs().add(i + 1, "day").format("MM/DD/YYYY");
        dayheaderEl.textContent = now;
        var imgEl = document.createElement('img');
        getWeatherIcon(data.daily[i].weather[0].icon, imgEl);
        dayListEl.appendChild(imgEl);
        createListElement(dayListEl, "Temp: " + data.daily[i].temp.day + "°F");
        createListElement(dayListEl, "Wind: " + data.daily[i].wind_speed + "MPH " + getWindDirection(data.current.wind_deg));
        createListElement(dayListEl, "Humidity: " + data.daily[i].humidity + "%");
    }
}

// condenses code I would have repeated a lot
// creates a new list element fills it with the text/ html then appends to parent
var createListElement = function (parent, htmlContent) {
    var listEl = document.createElement("li");
    listEl.innerHTML = htmlContent;
    parent.appendChild(listEl);
}

// called from geocode API
var updateLocation = function (currentCity) {
    console.log(currentCity);
    // turns data from API into a coheirent address
    var cityName = ""
    if (currentCity.locality) {cityName = currentCity.locality}
    if (currentCity.region_code && cityName) {cityName += ", " + currentCity.region_code}
    else {cityName = currentCity.region};
    if (cityName) {cityName += ", " + currentCity.country_code}
    else {cityName = currentCity.country}

    // gets date and assignes it with the city name
    var now = dayjs().format("MM/DD/YYYY");
    cityHeaderEl.textContent = cityName.split(",")[0] + " - " + now;

    // if city already exists this aborts the function before it is written twice
    for (var i = 0; i < recents.length; i++) {
        if (recents[i].name == cityName) {
            return;
        }
    }

    // pushes newest location to the front of array and stores locally
    recents.unshift({
        name: cityName,
        lat: currentCity.latitude,
        lon: currentCity.longitude
    });
    if (recents.length > 5) {
        recents.pop();
    }
    localStorage.setItem("recents", JSON.stringify(recents));

    // calls an update for the newest additions to the array
    getRecents();
}

// generates the recent button
var getRecents = function () {

    // clears it first
    recentEl.textContent = "";

    // loops through the list of previous locations
    for (var i = 0; i < recents.length; i++) {
        var buttonEl = document.createElement("button");
        buttonEl.textContent = recents[i].name;
        buttonEl.classList = "btn btn-recent mt-3 p-2 w-100 ";
        buttonEl.setAttribute("data-index", i);

        recentEl.appendChild(buttonEl);
    }
};

// after the user click a recent button this is run
var repeatSearch = function (event) {

    // gets the index of the array from the button's data element
    var index = event.target.getAttribute("data-index");

    // finds the location data and send it to weather API
    getWeather(recents[index].lat, recents[index].lon);

    // get the date
    var now = dayjs().format("MM/DD/YYYY");

    // sets the header witht the city name and the date
    cityHeaderEl.textContent = recents[index].name.split(",")[0] + " - " + now;
}

// script to determine wind direction from degrees
var getWindDirection = function (deg) {

    // reduces the possibility space from 360 to 8
    var directionNum = Math.round((deg / 45));

    // switch case converts number to directional text 
    switch (directionNum) {
        case 0:
            return "N";
        case 1:
            return "NE";
        case 2:
            return "E";
        case 3:
            return "SE";
        case 4:
            return "S";
        case 5:
            return "SW";
        case 6:
            return "W";
        case 7:
            return "NW";
        case 8:
            return "N";
    }
}

// simple function to determine UV severity
var getUV = function (UV) {
    if (UV <= 2) {
        return "rgb(69,184,54)";
    } else if (UV <= 5) {
        return "rgb(243,239,18)";
    } else if (UV <= 7) {
        return "rgb(243,153,18)";
    } else if (UV <= 10) {
        return "rgb(216,38,38)";
    } else {
        return "rgb(174,33,255)";
    }
}

// calls the recents once upon load
getRecents();

// listens for a submit event on the search box
addressFormEl.addEventListener("submit", getGeocode);

// listens for a click to the a recent button
recentEl.addEventListener("click", repeatSearch);