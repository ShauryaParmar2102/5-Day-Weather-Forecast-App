//Selects HTML elements 
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn")
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "ffcaebd982d99a5d9de8dd019a46f228"; //API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0){ //HTML for main weather card
        return ` <div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>

                <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;

    } else { //HTML for the 5 day forecast card
        return `<li class="card">
            <h3> (${weatherItem.dt_txt.split(" ")[0]})</h3>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
            <h4>Temp: ${(weatherItem.main.temp).toFixed(2)}°C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => { //Real weather data is fetched using coordinates.
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`; //Gets 5 day forecast and every 3hr weather data

fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        //Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = []; //Removes duplicate days so user only gets 1 forecast per day instead of every 3 hrs
        const fiveDaysForecast = data.list.filter(forecast => { //This is the full forecast from OpenWeather
            const forecastDate = new Date(forecast.dt_txt).getDate(); //This extracts the day number

            if(!uniqueForecastDays.includes(forecastDate)) { 
             // Remove duplicate days, keep first entry of each day
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //Clears previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {

            if(index === 0) { //This creates Big current weather display, city name, temperature, wind, humidity and weather icon

                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index)); //This builds HTML for each weather card.

            } else { //Creates 5 day weather forecast cards
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }

        });
    }).catch(() => {
        alert("An error occured while fetching weather forecast!"); //If 
    })
}


const getCityCoordinates = () => { //Takes city name and gets its coordinates.

    const cityName = cityInput.value.trim(); //Get user city entered name and remove extra spaces

    if(!cityName) return; //Return if cityName is empty

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //Get entered city coordinates (Latitude, longitude and name) from the API response
    fetch(GEOCODING_API_URL) // Sends request to OpenWeather geocoding API using the city name

    .then(res => res.json()) //Converts response into usable JSON
    .then(data => {
        console.log(data)

        
            //These functions are needed for weather data to display on the UI
            const { name, lat, lon } = data[0]; //Takes the first result from the API
            getWeatherDetails(name, lat, lon); //Sends first result to weather function

    }).catch(() => {
        alert("An error occured while fetching the city!"); //If city is invalid, this error message comes
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL =`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                fetch(REVERSE_GEOCODING_URL) .then(res => res.json())
                
                .then(data => {
        console.log(data)
        if(!data.length) return alert(`No coordinates found for your location`); //If API returns an empty array, no city was found
        const { name, lat, lon } = data[0]; // Extract useful values from the first result

        
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occured while fetching the city!");
    });

        },
        error => {  
            console.log(error);
        }
    );
}

searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);