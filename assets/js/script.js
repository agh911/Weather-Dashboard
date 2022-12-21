// OpenWeather API
var apiKey = 'f0ef0998304d20b1abdbebff004985e3';
var baseURL = 'https://api.openweathermap.org/data/2.5/';
var currentURL = baseURL + `weather?appid=${apiKey}&units=metric&`;
var forecastURL = baseURL + `forecast?appid=${apiKey}&units=metric&`;
var iconURL = 'https://openweathermap.org/img/w/';

// Grab needed elements
var cityInput = $('#search-input');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-btn');
var locationHistory = $('#history');
var today = $('#today');
var displayDate = $(".current-day");
var daysForecast = $('#forecast');
var city = '';
var currentDay = moment().format('D/M/YYYY');
var forecastDay = moment();

function getCity(event) {
  // Prevent page from refreshing when clicking on the search button
  event.preventDefault();
  city = cityInput.val().trim();
  cityInputSubmitted(city);
}

function cityInputSubmitted(cityName) {
  today.html('');
  daysForecast.html('');
  
  // If there is no city input then return an alert
  if (!cityName) {
    return alert('Please enter a location first.');
  }

  $.get(currentURL + `q=${cityName}`)
    .then(function (currentData) {
      // Inject HTML code into #today section with the current day weather conditions 
      today.append(`
         <div class="weather-today p-3 mb-3 pl-4">
            <h1>${currentData.name} ${currentDay} <img src="${iconURL + currentData.weather[0].icon}.png"></h1>
            <p>Temperature: ${Math.round(currentData.main.temp)}ºC</p>
            <p>Wind Speed: ${currentData.wind.speed} KPH</p>
            <p>Humidity: ${currentData.main.humidity}%</p>
          </div>
          <h3 id="forecast-headline">5-Day Forecast:</h3>
        `)

      $.get(forecastURL + `lat=${currentData.coord.lat}&lon=${currentData.coord.lon}`)
        .then(function (forecastData) {
          for (var forecastObj of forecastData.list) {
            if (forecastObj.dt_txt.includes("12:00:00")) {
              // Update forecast days 
              forecastDay.add(1, 'day');
              // Inject HTML code to display forecast cards
              daysForecast.append(`
                <div class="forecast-days ml-3 mr-3 p-4 mb-4">
                <p class="forecast-date"><b>${forecastDay.format('D/M/YYYY')}</b></p>
                <img src="${iconURL + forecastObj.weather[0].icon}.png">
                <p>Temp: ${Math.round(forecastObj.main.temp)}ºC</p>
                <p>Humidity: ${forecastObj.main.humidity}%</p>
                </div>
              `);
            }
          }
          // Reset forecastDay
          forecastDay = moment();
        });
    })
}

// Save locations to localStorage
function getLocations() {
  return JSON.parse(localStorage.getItem('locations')) || [];
}

function saveLocation(arr) {
  localStorage.setItem('locations', JSON.stringify(arr));
}

function displayLocation() {
  var locations = getLocations();
  locationHistory.html('');

  // Display 'Freviously searched:' paragraph only if the locations array is not empty
  if(locations.length > 0) {
    locationHistory.append(`
    <p id="previous-search">Previously searched:</p>
    `);
  }

  locations.forEach(function (location, index) {
    locationHistory.append(`
    <button id="location-${index}" class="btn btn-outline-dark mb-2 prev-location-btn">${location}</button>
    `)
  })
}

function addLocation(event) {
  var addClick = event.type;

  if (addClick === 'click') {
    var locations = getLocations();
    var locationText = cityInput.val();
    // Uppercase first letter of city name
    locationText = locationText.charAt(0).toUpperCase() + locationText.slice(1);

    // If there is no location input or the entered location is already saved to localStorage -> skip it
    if (!locationText || locations.includes(locationText)) return;

    locations.push(locationText);
    saveLocation(locations);

    $('#previous-search').val('');
    cityInput.val('');

    displayLocation();
  }
}

// Clear localStorage
function clearHistory(event) {
  localStorage.clear();
  // Remove injected HTML with previously saved locations
  locationHistory.html('');
}
clearBtn.click(clearHistory);

// Get forecast from displayed location history
$(document).on("click", ".prev-location-btn", function () {
  var previousLocation = $(this).text();
  cityInputSubmitted(previousLocation);
});

function init() {
  searchBtn.click(getCity);
  searchBtn.click(addLocation);
  displayLocation();
}

init();