// **** API Keys
const weatherAPIKey = "9e03a6c7f0ba2e4656ccae5173395c67";
const newsAPIKey = "672d23db8d8e1e3f239fbadd885571c7";

const nasaUrl =
  "https://api.nasa.gov/planetary/apod?api_key=jG4EQfaRenYdXggGHiLnjwGkSy9oY1M5vnYdcilp";

const rudeJokeUrl =
  "https://v2.jokeapi.dev/joke/Any?blacklistFlags=racist,sexist";
const safeJokeUrl = "https://v2.jokeapi.dev/joke/Any?safe-mode";

// **** Element Selectors
const dateTimeDisplay = document.getElementById("date-time");
const dateDisplay = dateTimeDisplay.querySelector("#date");
const timeDisplay = dateTimeDisplay.querySelector("#time");
const weatherCard = document.getElementById("weather-display");
const weatherImage = document.getElementById("weather-image");
const newsDisplayArea = document.getElementById("news");
const jokeDisplayArea = document.getElementById("joke-display");
const nasaDisplayArea = document.getElementById("nasa");

const safeJokeBtn = document.getElementById("safe-joke-button");
const rudeJokeBtn = document.getElementById("rude-joke-button");

safeJokeBtn.addEventListener("click", () => getJoke(safeJokeUrl));
rudeJokeBtn.addEventListener("click", () => getJoke(rudeJokeUrl));

// **** DOM Utils
let spinnerIndex = 0;
function showSpinner(displayArea) {
  const spinners = [
    "text-primary",
    "text-secondary",
    "text-success",
    "text-danger",
    "text-warning",
    "text-info",
  ];
  displayArea.innerHTML = `<div class="text-center">
	<div class="spinner-grow ${spinners[spinnerIndex]}" role="status">
	  <span class="visually-hidden">Loading...</span>
	</div>
  </div>`;
  if (spinnerIndex == 5) {
    spinnerIndex = 0;
  } else {
    spinnerIndex += 1;
  }
}

function showError(displayArea, message) {
  displayArea.innerHTML = `<p>${message}</p>`;
}

// **** Random Number Generator
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
// **** Clock

let today = new Date();

function getFormattedDate(dateobj, format = "en-GB") {
  return dateobj.toLocaleDateString(
    format, // locale
    {
      // options
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

dateDisplay.textContent = getFormattedDate(today);

function getFormattedTime(
  dateobj,
  format = "en-GB",
  options = { hour: "2-digit", minute: "2-digit", second: "2-digit" }
) {
  return dateobj.toLocaleTimeString(
    format, // locale
    options
  );
}

function tick() {
  const time = new Date();
  timeDisplay.innerText = getFormattedTime(time);

  // Only update date if dates are not equal
  if (time.getDate() !== today.getDate()) {
    today = time;
    dateDisplay.textContent = getFormattedDate(today);
  }
}

tick();
setInterval(tick, 1000);

// **** Weather
function renderWeather(data = {}, area = weatherCard) {
  console.log("data", data);
  const { weather } = data;
  const report = document.createElement("div");
  report.innerHTML = `<dl>
	<dt>City</dt>
	<dd>${data.name}, ${data.sys.country}</dd>
	<dt>Forecast</dt>
	<dd>
	  ${data.main.temp}&deg;C
	</dd>
	<dd>
	  <ul>
		${weather
      .map(
        (weather) =>
          `<li id="weather-forecast">${weather.main} (${weather.description})</li>`
      )
      .join("")}
	  <ul>
	</dd>
	<dt>Wind</dt>
	<dd>${data.wind.speed}kts at ${data.wind.deg} degrees</dd>
  </dl>`;
  area.replaceChildren(report);
  loadWeatherImages();
}

function createEndpointURL({ apiKey, lat, lon, units = "metric" }) {
  return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
}

async function loadDynamicWeather(
  area = weatherDisplay,
  renderWeather = () => {}
) {
  showSpinner(area);

  try {
    // Get from our machine's geolocation
    const options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0,
    };

    const position = await new Promise((resolve, reject) => {
      return navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    let { latitude: lat, longitude: lon } = position.coords;

    console.log(position);

    // Now use position to make the weather API call...
    const response = await fetch(
      createEndpointURL({ apiKey: weatherAPIKey, lat, lon })
    );
    if (!response.ok) throw response;
    const data = await response.json();
    // console.log("data", data);
    // debugger;
    renderWeather(data);
  } catch (err) {
    showError(area, err.statusText || err.message);
  }
}

loadDynamicWeather(weatherCard, renderWeather);

//**** Weather picture */
async function loadWeatherImages() {
  showSpinner(weatherImage);
  const forecast = document
    .getElementById("weather-forecast")
    .textContent.toLowerCase();
  console.log(
    "🚀 ~ file: main.js ~ line 151 ~ loadWeatherImage ~ forecast",
    forecast
  );
  const regex1 = /[^a-z ^:space:]/gm;
  const regex2 = /\s/gm;
  const searchTerm = forecast.replace(regex1, "").replace(regex2, "&");
  console.log(
    "🚀 ~ file: main.js ~ line 159 ~ loadWeatherImage ~ searchTerm",
    searchTerm
  );
  const weatherPictureUrl = `https://api.pexels.com/v1/search?query=${searchTerm}&per_page=10`;

  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "563492ad6f91700001000001ab9ae5ec53114e438dd9154ff8304b10"
  );
  //   myHeaders.append(
  //     "Cookie",
  //     "__cf_bm=FhjS.zIpFRjexlk7eIXVTel3GBa3b0Fa6TZk4UR.Bio-1654453560-0-ATHJ4Z7I18QXklDbnDpWgUIipXjiAG3MscqQK9uBCwdczsnQzn5sYDv0hkPKtWYJe2qfVCfGEYXk5DDINUkYKoc="
  //   );

  const requestOptions = {
    // method: "GET",
    headers: myHeaders,
    // redirect: "follow",
  };

  try {
    const response = await fetch(weatherPictureUrl, requestOptions);

    if (!response.ok) {
      throw response;
    }
    const data = await response.json();
    console.log(
      "🚀 ~ file: main.js ~ line 184 ~ loadWeatherImage ~ data",
      data
    );
    displayWeatherImage(data, 0, 10);
  } catch (err) {
    console.log(err);
    showError(err);
  }
  //   weatherImage.replaceWith(imgElement);
}

function displayWeatherImage(weatherImagesJson, min = 0, max = 10) {
  const weatherImage = document.getElementById("weather-image");
  const index = getRandomInt(min, max);
  const imageUrl = weatherImagesJson.photos[index].src.original;
  const imgElement = document.createElement("img");
  imgElement.src = imageUrl;
  imgElement.alt = weatherImagesJson.photos[index].alt;
  imgElement.classList.add("card-img-top");
  imgElement.classList.add("img-thumbnail");
  imgElement.id = "weather-image";
  console.log(
    "🚀 ~ file: main.js ~ line 194 ~ displayWeatherImage ~ imgElement",
    imgElement
  );
  //   return imgElement;
  weatherImage.replaceWith(imgElement);
}

//*** GNews */
async function getNews() {
  try {
    showSpinner(newsDisplayArea);
    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?&token=${newsAPIKey}&lang=en`
    );
    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    renderNews(data);
  } catch (err) {
    console.log(err);
  }
}

function renderNews(data) {
  console.log("news data", data);
  const articlesArr = Array.from(data.articles);
  console.log("news array", articlesArr);
  const accordion = document.createElement("div");
  accordion.classList.add("accordion");
  accordion.id = "newsAccordion";
  let articleCounter = 1;
  const frag = new DocumentFragment();
  const title = document.createElement("h2");
  title.textContent = "Top News Stories";
  frag.appendChild(title);

  for (const article of articlesArr) {
    const title = article.title;
    const description = article.description;
    const imageUrl = article.image;
    const sourceName = article.source.name;
    const articleLink = article.url;

    // const wrapperInsertArea = frag.getElementById("newsAccordion");
    // console.log(
    //   "🚀 ~ file: main.js ~ line 249 ~ renderNews ~ wrapperInsertArea",
    //   wrapperInsertArea
    // );

    const element = document.createElement("div");
    element.classList.add("accordion-item");

    // console.log(
    //   "🚀 ~ file: main.js ~ line 259 ~ renderNews ~ element",
    //   element
    // );
    element.innerHTML = `<h3 class="accordion-header" id="heading${articleCounter}">
	<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${articleCounter}" aria-expanded="true" aria-controls="collapse${articleCounter}" font-size='3rem'>
	  ${title}
	</button>
  </h3>
  <div id="collapse${articleCounter}" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#newsAccordion">
	<div class="accordion-body">
	  <div class="news-description">${description} <a href="${articleLink}">Read More at ${sourceName}</a></div>
	  <div class="news-image"><img src="${imageUrl}" class="img-fluid"></div>
	</div>
  </div>`;
    articleCounter += 1;
    frag.appendChild(element);
  }
  accordion.appendChild(frag);
  newsDisplayArea.replaceChildren(accordion);
}
getNews();

//****** Joke */

async function getJoke(jokeUrl) {
  try {
    const response = await fetch(jokeUrl);

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();

    renderJoke(data);
  } catch (err) {
    console.log(err);
  }
}

function renderJoke(data) {
  console.log("🚀 ~ file: main.js ~ line 332 ~ renderJoke ~ data", data);
  const type = data.type;
  const frag = new DocumentFragment();
  if (type == "single") {
    const joke = formatJoke(data.joke, "\n");
    const placeFiller = document.createElement("p");
    frag.appendChild(joke);
    frag.appendChild(placeFiller);
  }
  if (type == "twopart") {
    const setup = formatJoke(data.setup, "\n");
    frag.appendChild(setup);
    const delivery = formatJoke(data.delivery, "\n");
    frag.appendChild(delivery);
  } /* else {
    const errorMsg = document.createElement("p");
    errorMsg.textContent = `Sorry. Unable to display joke. Please try again.`;
    frag.appendChild(errorMsg);
  } */
  jokeDisplayArea.replaceChildren(frag);
  console.log("🚀 ~ file: main.js ~ line 354 ~ renderJoke ~ frag", frag);
}

function formatJoke(string, splitPattern) {
  const frag = new DocumentFragment();
  if (string.includes(splitPattern)) {
    const lines = string.split(splitPattern);
    for (const line of lines) {
      const newLine = document.createElement("p");
      newLine.textContent = line;
      frag.appendChild(newLine);
    }
    return frag;
  } else {
    const text = document.createElement("p");
    text.textContent = string;
    frag.appendChild(text);
    return frag;
  }
}

getJoke(safeJokeUrl);

//***** NASA APOD (Astronomy Picture of the Day) */
async function getNasaApod() {
  try {
    const response = await fetch(nasaUrl);

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();

    renderNasaApod(data);
  } catch (err) {
    console.log(err);
  }
}

function renderNasaApod(data) {
  const imageUrl = data.url;
  const title = data.title;
  const explanation = data.explanation;

  nasaDisplayArea.innerHTML = `<h2>NASA Astronomy Picture of the Day</h2><picture><img src=${imageUrl} alt=${title}><caption>${title}</caption></picture>`;
}

getNasaApod();
