// The Daily Dive

// jQuery
$(document).ready(function () {

  // VARIABLE DECLARATIONS

  // link html elements to js variables
  var cityName;
  var currentTemp;
  var tempMax;
  var tempMin;
  var humidity;
  var windSpeed;
  var windGust;
  var date;
  var time;
  var weatherDesc;
  var sunrise;
  var sunset;

  // FUNCTION DECLARATIONS

  // ask for user's locations from browser with window.navigator.geolocation
  function geolocateUser() {
    // if the location is successfully retrieved
    function onGeolocateSuccess(coordinates) {
      //   const { latitude, longitude } = coordinates.coords;
      //   console.log("user's coordinates: ", latitude, longitude);

      // pass this obj to weather api
      var geolocationObj = {
        lat: coordinates.coords.latitude,
        lon: coordinates.coords.longitude,
      };

      // call weather api with geolocationObj
      callWeatherAPI(geolocationObj);
      //JG added function for grabbing global news object

      callGlobalNewsAPI();
    }

    // if there is an error trying to grab geolocation
    function onGeolocateError(error) {
      console.warn(error.code, error.message);

      if (error.code === 1) {
        // they said no
      } else if (error.code === 2) {
        // position unavailable
      } else if (error.code === 3) {
        // timeout
      }
    }

    // if browser supports geolocation, get current position
    if (window.navigator && window.navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        onGeolocateSuccess,
        onGeolocateError
      );
    }
  }

  //            AUTHOR: Zach              //
  // -- Weather based on user location -- //
  function callWeatherAPI(geolocationObj) {
    var weatherBaseURL = "https://api.openweathermap.org/data/2.5/weather?";
    var weatherAPIKey = "24d3e77575ea6a3daa1e23b95dbe112f";
    var weatherURL = `${weatherBaseURL}lat=${geolocationObj.lat}&lon=${geolocationObj.lon}&appid=${weatherAPIKey}&units=imperial`;

    $.ajax({
      url: weatherURL,
      method: "GET",
    }).then(function (response) {
      console.log(response);

      //   updates time and date every 1000 milliseconds
      function updateTime() {
        setInterval(function () {
          var now = new Date();
          var localTime = now.toLocaleTimeString();
          var dateToday = now.toLocaleDateString();

          $(date).text(dateToday);
          $(time).text(localTime);
        }, 1000);
      }
      updateTime();

      // sunrise/sunset time formatted in HH:MM:SS
      sunriseObj = new Date(response.sys.sunrise * 1000).toLocaleTimeString();
      sunsetObj = new Date(response.sys.sunset * 1000).toLocaleTimeString();

      // update static html text with weather data
      $(cityName).text(response.name);
      $(tempMax).text(response.main.temp_max);
      $(tempMin).text(response.main.temp_min);
      $(humidity).text(response.main.humidity);
      $(windSpeed).text(response.wind.speed);
      $(windGust).text(response.wind.gust);
      $(weatherDesc).text(response.weather[0].description);
      $(sunrise).text(sunriseObj);
      $(sunset).text(sunsetObj);
    });
  }

  // ipstack retrieves user's location (city, region, and country) for local news
  function callIpstackAPI() {
    var ipstackAPIKey = "c2ea5ce2d2c3d8249ff25fa33fd14dd3";
    var ipstackBaseURL = `http://api.ipstack.com/`;
    // currently, the IP address is fixed to 134.201.250. In the future, we will use the user's IP address once I (Zach) figure out how to get that information.
    var ipstackURL = `${ipstackBaseURL}134.201.250.155?access_key=${ipstackAPIKey}`;
    $.ajax({
      url: ipstackURL,
      method: "GET",
    }).then(function (response) {
      console.log(response);

      var ipstackObj = {
        city: response.city,
        region: response.region_name,
        country: response.country_name,
      };
      // call local news and pass the name of user's city, region, and country
      callLocalNewsAPI(ipstackObj.city, ipstackObj.region, ipstackObj.country);
    });
  }

  // call ipstack, requires an IP address - currently using california IP address on line 111
  callIpstackAPI();

  //    -- Local News -- AUTHOR: Zach   //
  function callLocalNewsAPI(city, region, country) {
    // removes white spaces from variables
    city = city.replace(/ /g, "");
    region = region.replace(/ /g, "");
    country = country.replace(/ /g, "");
    var localNewsBaseURL =
      "https://api.nytimes.com/svc/search/v2/articlesearch.json?";
    var localNewsAPIKey = "B1bWnHrsG4FxF0rkw1Fg9cWo0bLCYrtE";
    var localNewsURL = `${localNewsBaseURL}fq=glocations.contains:${city},${region},${country}&api-key=${localNewsAPIKey}`;
    console.log(localNewsURL);
    $.ajax({
      url: localNewsURL,
      Method: "GET",
    }).then(function (response) {
      console.log(response);

      // alert user if there are no local news articles
      if (response.response.docs.length === 0) {
        alert("There are no local news stories at this time for " + city);
      }
    });
  }

  ///JG global news object function
  function callGlobalNewsAPI() {
    var globalNewsApiKey = "UCJMG4jj3LlXlGM9nUTRBZiy6aCx7huZ";
    var globalNewsUrl =
      "https://api.nytimes.com/svc/topstories/v2/world.json?api-key=" +
      globalNewsApiKey;
    console.log(globalNewsUrl);

    $.ajax({
      url: globalNewsUrl,
      method: "GET",
    }).then(function (response) {
      console.log("IN GLOBAL NEWS FUNCTION");
      var globalNewsData = response.results;
      //console.log(globalNewsData);
      for (var i = 0; i < 5; i++) {
        //console.log(globalNewsData[i]);
        var title = globalNewsData[i].title;
        var abstract = globalNewsData[i].abstract;
        var publishedDate = globalNewsData[i].published_date;
        var shortUrl = globalNewsData[i].short_url;
        publishedDate = moment().format("MMM Do YYYY");
        console.log("Title: " + title);
        console.log("abstract: " + abstract);
        console.log("Published Date: " + publishedDate);
        console.log("Short Url :" + shortUrl);

        buildCard(title, abstract, publishedDate, shortUrl);
      }
    });
  }

  //Build card function to be called inside each newsapi function
  // function buildCard(title,abstract,publishedDate,shortUrl)
  // {
  // var section = document.createElement("<section>");
  // section.setAttribute("class", "news col-md-2 mb-3");

  // var div = document.createElement("<div>")
  //   div.setAttribute("class", "");
  //   div.textContent(title);

  // }

  //--Calling Science/tech OBJ from NY API--//
  function techNewsData() {
    var techApiKey = "UAm8GChwLgFlI7l9sL58gMBAlx1H3XT3";
    var techUrl = `https://api.nytimes.com/svc/topstories/v2/technology.json?api-key=${techApiKey}`;
    console.log("tech News Api Function Call");
    fetch(techUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (CurrentNewsTech) {
        console.log(CurrentNewsTech);
        newsCards.innerHTML = `
        <section class="news col-md-2 mb-3">
          <div class="card">
            <img
              src="./assets/images/bill-wegener-CVIeAfFv4rM-unsplash.jpg"
              class="card-img-top"
              alt="..."
            />
            <div class="card-body">
             <a href ="" src =""></a> <h2 class="title">this will hold the title${title}</h2></a>
              <p class="card-text">
               the abstract will go here${abstract}
              </p>
              <p>${publishdate}</p>
            </div>
          </div>
        </section>

        <section class="news col-md-2 mb-3">
          <div class="card">
            <img
              src="./assets/images/brooke-lark-RMcJIvxhuW0-unsplash.jpg"
              class="card-img-top"
              alt="..."
            />
            <div class="card-body">
              <a href ="" src =""></a> <h2 class="title">this will hold the title${title}</h2></a>
              <p class="card-text">
                the abstract will go here${abstract}
                <p>${publishdate}</p>
              </p>
            </div>
          </div>
        </section>

        <section class="news col-md-2 mb-3">
          <div class="card">
            <img
              src="./assets/images/stephen-cook-ycduJobBI24-unsplash.jpg"
              class="card-img-top"
              alt="..."
            />
            <div class="card-body">
             <a href ="" src =""></a> <h2 class="title">this will hold the title${title}</h2></a>
              <p class="card-text">
               the abstract will go here${abstract}
              </p>
              <p>${publishdate}</p>
            </div>
          </div>
        </section>`;
      });
  }

  //      news articles with appropriate filters
  techNewsData();
  geolocateUser();

  // jQuery - keep code above the brackets below
});
