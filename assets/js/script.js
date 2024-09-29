// https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=imperial&appid=d9e9549e8a53f735de16dcee1e90044e
// https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=imperial&appid=d9e9549e8a53f735de16dcee1e90044e
// https://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit=1&appid=d9e9549e8a53f735de16dcee1e90044e
// https://openweathermap.org/img/wn/${icon-code}.png
const searchForm = document.getElementById("search-form");
const searchLocation = document.getElementById("location");
let searchRadio = document.getElementsByName("search-type");
let searchHistory = !localStorage.getItem("history") ? [] : JSON.parse(localStorage.getItem("history"));

showHistory();
// display searchHistory
function showHistory() {
    document.getElementById("search-history").innerHTML = "";
    for (result of searchHistory) {
        let btn = document.createElement("button");
        btn.textContent = result.name;
        btn.classList = "history-btn";
        btn.setAttribute("data-lat", result.lat);
        btn.setAttribute("data-lon", result.lon);
        btn.onclick = (event) => {
            console.log(event.target.dataset.lat)
            currentWeather(event.target.dataset.lat, event.target.dataset.lon);
            getForecast(event.target.dataset.lat, event.target.dataset.lon);
        }
        document.getElementById("search-history").appendChild(btn);
    }
}

//geolocation 
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(location => {
        let lon = location.coords.longitude;
        let lat = location.coords.latitude;
        currentWeather(lat.toFixed(2), lon.toFixed(2));
        getForecast(lat.toFixed(2), lon.toFixed(2));
    });
}

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    getCoords();
});

function getCoords() {
    let query = searchLocation.value;
    let countryCode = document.getElementById("country").value;
    let queryUrl = searchRadio[0].checked ?
        `https://api.openweathermap.org/geo/1.0/direct?q=${query},${countryCode}&limit=1&appid=d9e9549e8a53f735de16dcee1e90044e` :
        `https://api.openweathermap.org/geo/1.0/zip?zip=${query},${countryCode}&appid=d9e9549e8a53f735de16dcee1e90044e`;
    fetch(queryUrl)
        .then(function (response) {
            if (response.status !== 200) {
                alert(`Error:${response.statusText}`);
            }
            return response.json();
        })
        .then(function (data) {
            data = searchRadio[0].checked ? data[0] : data;
            console.log(data);
            saveHistory(query, data.lat.toFixed(2), data.lon.toFixed(2));
            currentWeather(data.lat.toFixed(2), data.lon.toFixed(2));
            getForecast(data.lat.toFixed(2), data.lon.toFixed(2));
        });
}

function currentWeather(lat, lon) {
    let queryUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=d9e9549e8a53f735de16dcee1e90044e`;
    fetch(queryUrl)
        .then(function (response) {
            if (response.status !== 200) {
                alert(`Error:${response.statusText}`);
            }
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            displayCurrent(data);
        });
}

function displayCurrent(data) {
    let date = new Date(data.dt * 1000);
    let weather = {
        name: data.name,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
        iconAlt: data.weather[0].description,
        date: `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`,
        temp: data.main.temp,
        wind: data.wind.speed,
        humidity: data.main.humidity
    }
    console.log(weather);

    document.getElementById("current-day").innerHTML = `
    <h2>${weather.name} (${weather.date})</h2>
    <img src=${weather.icon} alt=${weather.iconAlt}/>
    <h5>Temp: ${weather.temp}°F</h5>
    <h5>Wind: ${weather.wind} mph</h5>
    <h5>Humidity: ${weather.humidity}%</h5>
    `;
}

function getForecast(lat, lon) {
    let queryUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=d9e9549e8a53f735de16dcee1e90044e`;
    fetch(queryUrl)
        .then(function (response) {
            if (response.status !== 200) {
                alert(`Error:${response.statusText}`);
            }
            return response.json();
        })
        .then(function (data) {
            let forecasts = [];
            for (let i = 7; i < data.list.length; i += 8) {
                let date = new Date(data.list[i].dt * 1000);
                let weatherDay = {
                    icon: `https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png`,
                    iconAlt: data.list[i].weather[0].description,
                    date: `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`,
                    temp: data.list[i].main.temp,
                    wind: data.list[i].wind.speed,
                    humidity: data.list[i].main.humidity
                }
                forecasts.push(weatherDay);
            }
            displayForecast(forecasts);
        });
}

function displayForecast(forecasts) {
    let forecastSection = document.getElementById("5-day");
    forecastSection.innerHTML = "";
    let h3 = document.createElement("h3");
    h3.textContent = "5-day Forecast";
    forecastSection.appendChild(h3);
    for (weather of forecasts) {
        let card = document.createElement("div");
        card.classList = "card";
        card.innerHTML = `
        <h4>${weather.date}</h4>
        <img src=${weather.icon} alt=${weather.iconAlt}/>
        <h5>Temp: ${weather.temp}°F</h5>
        <h5>Wind: ${weather.wind} mph</h5>
        <h5>Humidity: ${weather.humidity}%</h5>
        `;
        forecastSection.appendChild(card);
    }
}

function saveHistory(name, lat, lon) {
    for (city of searchHistory){
        if (name == city.name || (lat == city.lat && lon == city.lon)){
            return;
        }
    }
    searchHistory.push({ name: name, lat: lat, lon: lon });
    while (searchHistory.length > 10) {
        searchHistory.shift();
    }
    localStorage.setItem("history", JSON.stringify(searchHistory));
    showHistory();
}