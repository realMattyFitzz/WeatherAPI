let cities = []
let city = "Phoenix"

let APIKey = "6e970f8a260385d6ad87dda004e9cb4f";
let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;

pageLoad();


$("#search-btn").on("click", function (e){
  e.preventDefault();
  city = $("#city-input").val();
  cities.push(city);
  getWeather(city);
  renderCities();
  $(".form-inline").trigger("reset")
})

$("#city-list").on("click", function (e){
  let element = e.target;
  if (element.matches("li")) {
    city = $(element).text();
    getWeather(city);
    renderCities();
  }
})

function pageLoad() {
  var storedCities = JSON.parse(localStorage.getItem("cities"));
  if (storedCities !== null) {
    cities = storedCities;
    index = storedCities.length - 1
    city = storedCities[index]
  }
  renderCities();
  getWeather(city);
}

function renderCities(){
  $("#forecast").empty();
  $(".list-group").empty();
  
  localStorage.setItem("cities", JSON.stringify(cities));
  cities.forEach((city) => {
    let $city = $("<li>").addClass("list-group-item").text(city);
    $(".list-group").prepend($city);
  })
}


function getWeather (city){
  let APIKey = "d9a9ca04881f1da4bcfcc61c47033231";
  let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {
    let date = moment.unix(response.dt).format("MM/DD/YYYY"); // Retrieves current date
    let cityName = response.name; // city name
    let lat = response.coord.lat; // latitude
    let lon = response.coord.lon; // longitude
    let temp = response.main.temp; // Finds temp
    let tempF = Math.round((temp - 273.15) * 1.8 + 32); // converts to F
    let wSpeed = response.wind.speed; // wind speed
    let hum = response.main.humidity; // humidity
    getUvIndex(lat, lon); // gets UV index & displays on page
    getFiveDay(cityName); // gets 5-day forecast and builds cards to display data
    // displays info on page
    $("#city-name").text(cityName+" "+date);
    $("#main-temp").text("Temperature: "+tempF+"°F");
    $("#main-hum").text("Humidity: "+hum+"%");
    $("#main-wind").text("Wind Speed: "+wSpeed+" mph");
  });
}


function getUvIndex (lat, lon){
  let uvQuery = "https://api.openweathermap.org/data/2.5/uvi?appid="+APIKey+"&lat="+lat+"&lon="+lon;
  $.ajax({
    url: uvQuery,
    method: "GET"
  }).then(function (uvResponse) {
    let uvIndex = uvResponse.value
    $("#uv").text(uvIndex)
    if (uvIndex < 3){
      $("#uv").attr("class", "uv-low")
    } else if (uvIndex < 6){
      $("#uv").attr("class", "uv-mod")
    } else if (uvIndex < 9){
      $("#uv").attr("class", "uv-high")
    } else if (uvIndex > 9) {
      $("#uv").attr("class", "uv-ext")
    }
  })
}

// Retrieves 5-day forecast
function getFiveDay (cityName) {
  let fiveQuery = "https://api.openweathermap.org/data/2.5/forecast?q="+cityName+"&appid="+APIKey;
  $.ajax({
    url: fiveQuery,
    method: "GET"
  }).then(function (fiveResponse) {
    let fiveList = fiveResponse.list;
    for (let i = 0; i < fiveList.length; i++) {
      let dayIndex = fiveList[i];
      let dateTime = dayIndex.dt_txt;  
      if (dateTime.includes("21:00")) {  
        
        let $card = $("<div>").addClass("card mr-3").attr("style", "width: 12rem");
        let $body = $("<div>").addClass("card-body");
        let fdDate = moment.unix(dayIndex.dt).format("MM/DD/YYYY"); // converts unix -> date
        let $date = $("<h6>").addClass("card-title").text(fdDate);
        let fdIconID = dayIndex.weather[0].icon; // icon
        // let $fdIcon = $("<img>").attr("src", "http://openweathermap.org/img/wn/"+fdIconID+"@2x.png")
        let fdTemp = dayIndex.main.temp; // temp
        let fdTempF = Math.round((fdTemp - 273.15) * 1.8 + 32); // convert to F
        let $temp = $("<p>").addClass("card-text").text("Temperature: "+fdTempF+"°F");
        let fdHum = dayIndex.main.humidity; // humidity
        let $hum = $("<p>").addClass("card-text").text("Humidity: "+fdHum+"%");
        
        // appends data to card & card to page
        $($body).append($date, $temp, $hum)
        $($card).append($body)
        $("#forecast").append($card)
      }
    }
  })
}