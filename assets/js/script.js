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
        date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
        temp: data.main.temp,
        wind: data.wind.speed,
        humidity: data.main.humidity
    }
    console.log(weather);

    document.getElementById("current-day").innerHTML = `
    <div id="title">
        <h2>${weather.name} (${weather.date})</h2>
        <img src=${weather.icon} alt=${weather.iconAlt}/>
    </div>
    <h4>Temp: ${weather.temp}°F</h4>
    <h4>Wind: ${weather.wind} mph</h4>
    <h4>Humidity: ${weather.humidity}%</h4>
    `;
    document.getElementById("current-day").style = "opacity: 1;"
    setBackground(data.weather[0].icon);
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
                    date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
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
    let forecastSection = document.getElementById("five-day");
    forecastSection.innerHTML = "";
    let h3 = document.createElement("h3");
    h3.textContent = "5-day Forecast";
    forecastSection.appendChild(h3);
    let cardSection = document.createElement("div");
    cardSection.classList = "card-section";
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
        cardSection.appendChild(card);
    }
    forecastSection.appendChild(cardSection);
    forecastSection.style = "opacity: 1;"
}

function saveHistory(name, lat, lon) {
    for (city of searchHistory) {
        if (name == city.name || (lat == city.lat && lon == city.lon)) {
            return;
        }
    }
    searchHistory.unshift({ name: name, lat: lat, lon: lon });
    while (searchHistory.length > 10) {
        searchHistory.shift();
    }
    localStorage.setItem("history", JSON.stringify(searchHistory));
    showHistory();
}

function setBackground(icon) {
    let main = document.getElementsByTagName("body")[0];

    switch (icon) {
        case "01d":
        case "02d":
            main.style.backgroundImage = "url('./assets/backgrounds/clear-sky.gif')";
            break;
        case "03d":
            main.style.backgroundImage = "url('./assets/backgrounds/scattered-clouds.gif')";
            break;
        case "04d":
            main.style.backgroundImage = "url('./assets/backgrounds/broken-clouds.gif')";
            break;
        case "01n":
        case "02n":
            main.style.backgroundImage = "url('./assets/backgrounds/clear-night.gif')";
            break;
        case "03n":
            main.style.backgroundImage = "url('./assets/backgrounds/scattered-clouds-night.gif')";
            break;
        case "04n":
            main.style.backgroundImage = "url('./assets/backgrounds/broken-clouds-night.gif')";
            break;
        case "50d":
            main.style.backgroundImage = "url('./assets/backgrounds/mist.gif')";
            break;
        case "50n":
            main.style.backgroundImage = "url('./assets/backgrounds/mist-night.gif')";
            break;
        case "09d":
        case "09n":
            main.style.backgroundImage = "url('./assets/backgrounds/shower.gif')";
            break;
        case "10d":
        case "10n":
            main.style.backgroundImage = "url('./assets/backgrounds/rain.gif')";
            break;
        case "11d":
        case "11n":
            main.style.backgroundImage = "url('./assets/backgrounds/thunderstorm.gif')";
            break;
        case "13d":
            main.style.backgroundImage = "url('./assets/backgrounds/snow-day.gif')";
            break;
        case "13n":
            main.style.backgroundImage = "url('./assets/backgrounds/snow-night.gif')";
            break;
        default:
            console.error(icon);
            break;
    }
    main.style.backgroundSize = "cover";  // Make the image cover the entire element
    main.style.backgroundPosition = "center";  // Center the image
    main.style.backgroundRepeat = "no-repeat";  // Prevent the image from repeating
}