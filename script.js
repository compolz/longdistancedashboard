let weatherSilverSpring, weatherSolon;

document.addEventListener('DOMContentLoaded', function() {
    // Automatically fetch weather data on page load
    const locations = [
        { name: 'Silver Spring', state: 'MD', label: "Diana's Weather" },
        { name: 'Solon', state: 'OH', label: "Gurleen's Weather" }
    ];

    // Fetch weather for both locations on load
    locations.forEach(location => {
        const city = `${location.name},${location.state}`;
        fetchWeather(city, location.label);
    });

    // Set up event listener for the refresh button
    document.getElementById('getWeatherBtn').addEventListener('click', function() {
        // Clear previous weather data and news articles to prevent duplicate entries
        document.getElementById('weather-data').innerHTML = '';
        document.getElementById('comparison-data').innerHTML = '';

        // Fetch weather again for both locations
        locations.forEach(location => {
            const city = `${location.name},${location.state}`;
            fetchWeather(city, location.label);
        });
    });
});

function fetchWeather(city, label) {
    const apiKey = '7d4e14d79b5e4c6a857221732240310'; // Your Weather API key
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data, label);
            if (label === "Diana's Weather") {
                weatherSilverSpring = data;
            } else if (label === "Gurleen's Weather") {
                weatherSolon = data;
            }
            if (weatherSilverSpring && weatherSolon) {
                calculateAndDisplayComparison();
            }
        })
        .catch(error => console.error('Error fetching weather:', error));
}

function displayWeather(weatherData, label) {
    const weatherDisplay = document.getElementById('weather-data');
    const weatherInfo = `
        <div class="weather-card">
            <h3>${label}</h3>
            <p>Temperature: ${weatherData.current.temp_f}°F</p>
            <p>Condition: ${weatherData.current.condition.text}</p>
            <img src="${weatherData.current.condition.icon}" alt="Weather icon">
            <p>Wind: ${weatherData.current.wind_mph} mph</p>
        </div>
    `;
    weatherDisplay.innerHTML += weatherInfo;
}

function calculateAndDisplayComparison() {
    const tempDifference = Math.abs(weatherSilverSpring.current.temp_f - weatherSolon.current.temp_f).toFixed(1);

    const comparisonSection = document.getElementById('comparison-data');
    const comparisonInfo = `
        <div class="comparison-card">
            <h3>Temperature Difference</h3>
            <p>The temperature difference between Diana's Weather (Silver Spring) and Gurleen's Weather (Solon) is <strong>${tempDifference}°F</strong>.</p>
        </div>
        <div class="news-card">
            <div class="news-panel">
                <h3>Diana's News</h3>
                <div id="news-silver-spring"></div>
            </div>
            <div class="news-panel">
                <h3>Gurleen's News</h3>
                <div id="news-cleveland"></div>
            </div>
        </div>
    `;
    comparisonSection.innerHTML = comparisonInfo;

    // Fetch news for both locations
    fetchNews('Silver Spring, MD', 'news-silver-spring');
    fetchNews('Cleveland, OH', 'news-cleveland');
}

function fetchNews(city, elementId) {
    const newsApiKey = '54da95d1df7141cc9b43a75838d7278c'; // Your NewsAPI key
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(city)}&apiKey=${newsApiKey}&pageSize=3`;

    fetch(newsApiUrl)
        .then(response => response.json())
        .then(data => {
            displayNews(data.articles, elementId);
        })
        .catch(error => console.error('Error fetching news:', error));
}

function displayNews(articles, elementId) {
    const newsContainer = document.getElementById(elementId);
    if (Array.isArray(articles) && articles.length > 0) {
        const newsHtml = articles.map(article => `
            <div class="news-article">
                <h4><a href="${article.url}" target="_blank">${article.title}</a></h4>
                <p>${article.description || 'No description available.'}</p>
            </div>
        `).join('');
        newsContainer.innerHTML = newsHtml;
    } else {
        newsContainer.innerHTML = '<p>No news articles available.</p>';
    }
}


// Function to initialize the Google Map
function initializeMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: { lat: 39.0034, lng: -77.0297 } // Center the map around Silver Spring
    });

    // Create markers for both locations
    const silverSpringMarker = new google.maps.Marker({
        position: { lat: 39.0034, lng: -77.0297 }, // Silver Spring coordinates
        map: map,
        title: "Diana's Weather"
    });

    const solonMarker = new google.maps.Marker({
        position: { lat: 41.3862, lng: -81.4417 }, // Solon coordinates
        map: map,
        title: "Gurleen's Weather"
    });

    // Draw a line between the two locations
    const flightPlanCoordinates = [
        { lat: 39.0034, lng: -77.0297 }, // Silver Spring
        { lat: 41.3862, lng: -81.4417 }   // Solon
    ];
    const flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    flightPath.setMap(map);
}

// Show the announcement modal when the page loads
window.onload = function() {
    const modal = document.getElementById('announcementModal');
    const closeModal = document.getElementById('closeModal');

    // Display the modal
    modal.style.display = 'block';

    // When the user clicks on <span> (x), close the modal
    closeModal.onclick = function() {
        modal.style.display = 'none';
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

