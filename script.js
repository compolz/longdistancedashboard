let weatherSilverSpring, weatherSolon;
let refreshTimeout; // Variable to store the timeout ID

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
    const refreshButton = document.getElementById('getWeatherBtn');
    refreshButton.addEventListener('click', function() {
        // If the button is disabled, do nothing
        if (refreshButton.disabled) return;

        // Clear previous weather data and news articles to prevent duplicate entries
        document.getElementById('weather-data').innerHTML = '';
        document.getElementById('comparison-data').innerHTML = '';

        // Fetch weather again for both locations
        const locations = [
            { name: 'Silver Spring', state: 'MD', label: "Diana's Weather" },
            { name: 'Solon', state: 'OH', label: "Gurleen's Weather" }
        ];
        locations.forEach(location => {
            const city = `${location.name},${location.state}`;
            fetchWeather(city, location.label);
        });

        // Disable the button and start the timer
        refreshButton.disabled = true;
        refreshButton.style.backgroundColor = '#ccc'; // Change button color to grey

        let countdown = 60; // Countdown starting at 60 seconds
        refreshButton.textContent = `Please wait ${countdown} seconds`;

        // Set a timer to re-enable the button after 1 minute (60000 milliseconds)
        refreshTimeout = setInterval(() => {
            countdown--;
            refreshButton.textContent = `Please wait ${countdown} seconds`;
            if (countdown <= 0) {
                clearInterval(refreshTimeout);
                refreshButton.disabled = false;
                refreshButton.style.backgroundColor = ''; // Reset button color
                refreshButton.textContent = 'Refresh Weather';
            }
        }, 1000); // Update every second
    });

    // Set up event listener for the close developer portal button
    document.getElementById('closeDeveloperSectionBtn').addEventListener('click', function() {
        document.getElementById('developer-section').style.display = 'none'; // Hide the developer section
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
    fetchNews('Silver Spring', 'news-silver-spring');
    fetchNews('Cleveland', 'news-cleveland');
}

function fetchNews(city, elementId) {
    const newsApiKey = '62b14d4ccdd74bc7d8730c0e67795991'; // Your GNews API key
    const newsApiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(city)}&token=${newsApiKey}&lang=en&max=3`;

    console.log('Fetching news from URL:', newsApiUrl); // Log the URL for debugging

    fetch(newsApiUrl)
        .then(response => {
            if (!response.ok) {
                document.getElementById(elementId).innerHTML = '<p>No news articles available.</p>';
                console.error('Network response was not ok', response.status, response.statusText);
                return; // Exit if there's an error
            }
            return response.json();
        })
        .then(data => {
            // Check if articles exist in the response
            if (data && data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
                displayNews(data.articles, elementId);
            } else {
                console.error('No articles found in the response:', data);
                document.getElementById(elementId).innerHTML = '<p>No news articles available.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            document.getElementById(elementId).innerHTML = '<p>No news articles available.</p>';
        });
}

function displayNews(articles, elementId) {
    const newsContainer = document.getElementById(elementId);
    const newsHtml = articles.map(article => `
        <div class="news-article">
            <h4><a href="${article.url}" target="_blank">${article.title}</a></h4>
            <p>${article.description || 'No description available.'}</p>
        </div>
    `).join('');
    newsContainer.innerHTML = newsHtml;
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

document.getElementById('checkKeyBtn').addEventListener('click', function() {
    const enteredKey = document.getElementById('dev-key').value; // Get the value from the input field

    // Check if the entered key matches the hard-coded key
    if (enteredKey === 'ilovediana') {
        document.getElementById('developer-section').style.display = 'block'; // Show the developer section
        document.getElementById('access-message').innerText = 'Success: Valid Key'; // Success message
        document.getElementById('access-message').style.color = 'green'; // Change text color to green
    } else {
        document.getElementById('access-message').innerText = 'ERROR: Invalid Key'; // Deny message
        document.getElementById('access-message').style.color = 'red'; // Change text color to red
    }
});

let updates = []; // Array to store updates

document.addEventListener('DOMContentLoaded', function() {
    // Load updates from localStorage on page load
    const storedUpdates = JSON.parse(localStorage.getItem('updates')) || [];
    updates = storedUpdates; // Initialize updates from localStorage
    updates.push('1 - Added Developer Portal + Updates section');
    updates.push('2 - Added timer to refresh weather button to avoid API overcall');
    displayUpdates(); // Display stored updates

    // Add event listener for the add update button
    document.getElementById('addUpdateBtn').addEventListener('click', function() {
        const newUpdate = document.getElementById('new-update').value; // Get the value from the input field
        if (newUpdate) {
            updates.push(newUpdate); // Add the new update to the updates array
            localStorage.setItem('updates', JSON.stringify(updates)); // Save updates to localStorage
            displayUpdates(); // Update the displayed list
            document.getElementById('update-message').innerText = `Update added: "${newUpdate}".`;
            document.getElementById('new-update').value = ''; // Clear the input field
        } else {
            document.getElementById('update-message').innerText = 'Please enter an update.'; // Show error message
        }
    });

    // Add event listener for the delete update button
    document.getElementById('deleteUpdateBtn').addEventListener('click', function() {
        const lastUpdate = updates.pop(); // Remove the last update from the array
        if (lastUpdate) {
            localStorage.setItem('updates', JSON.stringify(updates)); // Update localStorage
            displayUpdates(); // Update the displayed list
            document.getElementById('update-message').innerText = `Deleted update: "${lastUpdate}"`; // Show confirmation message
        } else {
            document.getElementById('update-message').innerText = 'No updates to delete.'; // Show error message
        }
    });
});

// Function to display updates
function displayUpdates() {
    const updatesList = document.getElementById('updates-list');
    updatesList.innerHTML = updates.map(update => `<li>${update}</li>`).join('');
}



