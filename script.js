document.getElementById('searchButton').addEventListener('click', function() {
    const query = document.getElementById('locationInput').value;
    fetchGeoCodeData(query);
});


document.getElementById('locationSelect').addEventListener('change', function() {
    const selectedLocation = this.value;
    fetchSunriseSunsetData(selectedLocation);
});

document.getElementById('currentLocationButton').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            fetchSunriseSunsetData(`${lat},${lng}`);
        }, function(error) {
            alert('Error occurred. Error code: ' + error.code);
            // error.code can be:
            //   0: unknown error
            //   1: permission denied
            //   2: position unavailable (error response from location provider)
            //   3: timed out
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

function fetchSunriseSunsetData(location) {
    // Fetch data for today
    const todayUrl = constructApiUrl(location, new Date());
    fetchDataAndUpdateTime(todayUrl, 'Today');

    // Fetch data for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowUrl = constructApiUrl(location, tomorrow);
    fetchDataAndUpdateTime(tomorrowUrl, 'Tomorrow');
}


function constructApiUrl(location, date) {
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    // Use the provided API endpoint
    return `https://api.sunrisesunset.io/json?lat=${location.split(',')[0]}&lng=${location.split(',')[1]}&date=${formattedDate}&formatted=0`;
}


function fetchDataAndUpdateTime(apiUrl, timeFrame) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Log the API response for debugging
            if (data.status === 'OK') {
                updateDashboard(data.results, timeFrame);
            } else {
                console.error('Failed to fetch data for ' + timeFrame);
            }
        })
        .catch(error => {
            console.error('Error: ' + error);
        });
}




function updateDashboard(data, timeFrame) {
    timeFrame = timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1).toLowerCase();

    document.getElementById(`sunrise${timeFrame}`).textContent = formatTime(data.sunrise);
    document.getElementById(`sunset${timeFrame}`).textContent = formatTime(data.sunset);
    document.getElementById(`dawn${timeFrame}`).textContent = formatTime(data.dawn);
    document.getElementById(`dusk${timeFrame}`).textContent = formatTime(data.dusk);
    document.getElementById(`dayLength${timeFrame}`).textContent = data.day_length;
    document.getElementById(`solarNoon${timeFrame}`).textContent = formatTime(data.solar_noon);

    if (data.timezone) {
        document.getElementById('timeZoneInfo').textContent = `Time Zone: ${data.timezone} (UTC ${data.utc_offset > 0 ? '+' : ''}${data.utc_offset / 60})`;
    } else {
        document.getElementById('timeZoneInfo').textContent = 'Time Zone data not available';
    }
}

function fetchGeoCodeData(query) {
    const geocodeUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(query)}`;

    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                fetchSunriseSunsetData(`${lat},${lon}`);
            } else {
                alert('No results found for the given location.');

            }
        })
        .catch(error => {
            console.error('Error fetching geocode data:', error);
            alert('An error occurred while fetching geocode data.');
        
        });
}

function formatTime(apiTime) {
    // Check if the time is already in 24-hour format
    if (apiTime.match(/\d{1,2}:\d{2}:\d{2}/)) {
        return apiTime;
    }

    // Convert AM/PM time to 24-hour format
    const date = new Date('1970-01-01 ' + apiTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}



function formatDayLength(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours, ${minutes} minutes`;
}
