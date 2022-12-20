/* 
  When Page Loads:

  1. Show user an input to allow them to search for a city
    - show a message on the page to point them, or guide them, to the input.
    - Once city has been inputted:
      a. Show Current Forecast
      b. Show 5 day Forecast
      c. Add city name to search history
        - Get previous searches from localStorage
        - If inputted city has not been stored to search history in localStorage, push the city name
        - Set the search history to localStorage
  2. Show search history
    - Pull search history from localStorage
    - If search history is not empty, output each city to the search history display in the DOM
*/


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

function getCity(event){
  event.preventDefault();
  city = cityInput.val().trim();
  cityInputSubmitted(city);
}

function cityInputSubmitted(cityName) {
  today.html('');
  daysForecast.html('');

    $.get(currentURL + `q=${cityName}`)
    .then(function(currentData) {
        // console.log(currentData);
        // Inject HTML code into #today section with the current day weather conditions 
        today.append(`
         <div class="weather-today p-3">
            <h1>${currentData.name} ${currentDay} <img src="${iconURL + currentData.weather[0].icon}.png"></h1>
            <p>Temp: ${Math.round(currentData.main.temp)}ºC</p>
            <p>Wind: ${currentData.wind.speed} KPH</p>
            <p>Humidity: ${currentData.main.humidity}%</p>
          </div>
        `)

        $.get(forecastURL + `lat=${currentData.coord.lat}&lon=${currentData.coord.lon}`)
        .then(function(forecastData) {
          // console.log(forecastData);
          for (var forecastObj of forecastData.list) {
            if (forecastObj.dt_txt.includes("12:00:00")) {
              // Update forecast days 
              forecastDay.add(1, 'day');
              // Inject HTML code to display forecast cards
              daysForecast.append(`
                <div class="forecast-days ml-3 p-4">
                <p class="forecast-date">${forecastDay.format('D/M/YYYY')}</p>
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

  locations.forEach(function(location, index) {
    locationHistory.append(`
    <button class="col-lg-10 mb-2 prev-location-btn location-${index}">${location}</button>
    `)
  })
}

function addLocation(event) {
  var addClick = event.type;

  if (addClick === 'click') {
    var locations = getLocations();
    var locationText = cityInput.val();

    // If there is no location input or the entered location is already saved to localStorage -> skip it
    if(!locationText || locations.includes(locationText)) return;

    locations.push(locationText);
    saveLocation(locations);

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
function getForecastFromHistory(event) {
  previousLocation = event.target.innerText;
  console.log(previousLocation);
  cityInputSubmitted(previousLocation);
}

function init() {
  searchBtn.click(getCity);
  searchBtn.click(addLocation);
  displayLocation();
  $('.prev-location-btn').click(getForecastFromHistory);
}

init();
