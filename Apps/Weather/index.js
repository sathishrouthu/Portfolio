/**
 * Weather Forecast Application
 * Using WeatherAPI.com for weather data
 */

class WeatherApp {
    constructor() {
        // API Configuration
        this.apiKey = '7088b49e476f445a991154027253108';
        this.baseUrl = 'http://api.weatherapi.com/v1';
        
        // App State
        this.currentLocation = null;
        this.currentWeatherData = null;
        this.forecastData = null;
        this.recentSearches = [];
        this.maxRecentSearches = 5;
        
        // DOM Elements
        this.elements = {};
        
        // Weather condition mappings for background changes
        this.weatherConditions = {
            'sunny': ['sunny', 'clear'],
            'cloudy': ['cloudy', 'overcast', 'partly cloudy'],
            'rainy': ['rain', 'drizzle', 'shower', 'thundery outbreaks'],
            'snowy': ['snow', 'sleet', 'blizzard'],
            'thunderstorm': ['thunderstorm', 'thunder'],
            'mist': ['mist', 'fog', 'freezing fog'],
            'clear-night': ['clear night']
        };
        
        // Initialize the app
        this.init();
    }

    /**
     * Initialize the weather application
     */
    init() {
        this.bindDOMElements();
        this.attachEventListeners();
        this.loadRecentSearches();
        this.updateCurrentTime();
        
        // Try to get user's location or load default city
        this.getCurrentLocation();
    }

    /**
     * Bind DOM elements for easy access
     */
    bindDOMElements() {
        this.elements = {
            // Search elements
            locationInput: document.getElementById('locationInput'),
            searchBtn: document.getElementById('searchBtn'),
            locationBtn: document.getElementById('locationBtn'),
            searchSuggestions: document.getElementById('searchSuggestions'),
            
            // State elements
            loadingState: document.getElementById('loadingState'),
            errorState: document.getElementById('errorState'),
            errorMessage: document.getElementById('errorMessage'),
            weatherContent: document.getElementById('weatherContent'),
            
            // Current weather elements
            currentLocation: document.getElementById('currentLocation'),
            currentCountry: document.getElementById('currentCountry'),
            currentTime: document.getElementById('currentTime'),
            lastUpdated: document.getElementById('lastUpdated'),
            currentWeatherIcon: document.getElementById('currentWeatherIcon'),
            currentTemp: document.getElementById('currentTemp'),
            currentCondition: document.getElementById('currentCondition'),
            feelsLike: document.getElementById('feelsLike'),
            
            // Weather details
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            windDirection: document.getElementById('windDirection'),
            pressure: document.getElementById('pressure'),
            visibility: document.getElementById('visibility'),
            uvIndex: document.getElementById('uvIndex'),
            uvCategory: document.getElementById('uvCategory'),
            airQuality: document.getElementById('airQuality'),
            airQualityLevel: document.getElementById('airQualityLevel'),
            
            // Forecast elements
            hourlyForecast: document.getElementById('hourlyForecast'),
            weeklyForecast: document.getElementById('weeklyForecast'),
            
            // Astronomy elements
            sunrise: document.getElementById('sunrise'),
            sunset: document.getElementById('sunset'),
            daylightHours: document.getElementById('daylightHours'),
            moonrise: document.getElementById('moonrise'),
            moonset: document.getElementById('moonset'),
            moonPhase: document.getElementById('moonPhase'),
            moonIllumination: document.getElementById('moonIllumination'),
            
            // Alerts and modals
            weatherAlertsCard: document.getElementById('weatherAlertsCard'),
            weatherAlerts: document.getElementById('weatherAlerts'),
            recentSearchesModal: document.getElementById('recentSearchesModal'),
            recentSearchesList: document.getElementById('recentSearchesList'),
            clearRecentSearches: document.getElementById('clearRecentSearches')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search functionality
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        this.elements.locationInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
        
        // Location detection
        this.elements.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        
        // Recent searches
        if (this.elements.clearRecentSearches) {
            this.elements.clearRecentSearches.addEventListener('click', () => this.clearRecentSearches());
        }
        
        // Click outside to hide suggestions
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });
        
        // Update time every minute
        setInterval(() => this.updateCurrentTime(), 60000);
    }

    /**
     * Handle search input for suggestions
     */
    async handleSearchInput(query) {
        if (query.length < 3) {
            this.hideSuggestions();
            return;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/search.json?key=${this.apiKey}&q=${encodeURIComponent(query)}`
            );
            
            if (response.ok) {
                const suggestions = await response.json();
                this.showSuggestions(suggestions);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    /**
     * Show search suggestions
     */
    showSuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        const suggestionsHtml = suggestions.slice(0, 5).map(suggestion => `
            <div class="suggestion-item" onclick="weatherApp.selectSuggestion('${suggestion.name}, ${suggestion.country}')">
                <div>
                    <strong>${suggestion.name}</strong>
                    <small class="text-muted">${suggestion.region}, ${suggestion.country}</small>
                </div>
            </div>
        `).join('');

        this.elements.searchSuggestions.innerHTML = suggestionsHtml;
        this.elements.searchSuggestions.classList.remove('d-none');
    }

    /**
     * Hide search suggestions
     */
    hideSuggestions() {
        this.elements.searchSuggestions.classList.add('d-none');
    }

    /**
     * Select a suggestion
     */
    selectSuggestion(location) {
        this.elements.locationInput.value = location;
        this.hideSuggestions();
        this.searchWeather(location);
    }

    /**
     * Handle search button click
     */
    handleSearch() {
        const location = this.elements.locationInput.value.trim();
        if (location) {
            this.searchWeather(location);
        }
    }

    /**
     * Get user's current location
     */
    getCurrentLocation() {
        this.showLoading();
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    this.searchWeatherByCoords(lat, lon);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    // Fallback to a default city
                    this.searchWeather('London');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        } else {
            // Geolocation not supported, use default
            this.searchWeather('London');
        }
    }

    /**
     * Search weather by coordinates
     */
    async searchWeatherByCoords(lat, lon) {
        try {
            await this.fetchWeatherData(`${lat},${lon}`);
        } catch (error) {
            this.showError('Unable to fetch weather data for your location');
        }
    }

    /**
     * Search weather by location name
     */
    async searchWeather(location) {
        this.showLoading();
        try {
            await this.fetchWeatherData(location);
            this.addToRecentSearches(location);
        } catch (error) {
            this.showError('Unable to find weather data for this location');
        }
    }

    /**
     * Fetch weather data from API
     */
    async fetchWeatherData(query) {
        try {
            // Fetch current weather and forecast
            const [currentResponse, forecastResponse, airQualityResponse] = await Promise.all([
                fetch(`${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(query)}&aqi=yes`),
                fetch(`${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=yes`),
                fetch(`${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(query)}&aqi=yes`)
            ]);

            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('Weather data not found');
            }

            const [currentData, forecastData] = await Promise.all([
                currentResponse.json(),
                forecastResponse.json()
            ]);

            this.currentWeatherData = currentData;
            this.forecastData = forecastData;
            this.currentLocation = currentData.location;

            this.updateWeatherDisplay();
            this.hideLoading();
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }

    /**
     * Update the weather display
     */
    updateWeatherDisplay() {
        if (!this.currentWeatherData || !this.forecastData) return;

        const current = this.currentWeatherData.current;
        const location = this.currentWeatherData.location;
        const forecast = this.forecastData.forecast;
        const astro = forecast.forecastday[0].astro;

        // Update background based on weather condition
        this.updateWeatherBackground(current.condition.text, current.is_day);

        // Update current weather
        this.updateCurrentWeather(current, location);
        
        // Update weather details
        this.updateWeatherDetails(current);
        
        // Update forecasts
        this.updateHourlyForecast(forecast.forecastday[0].hour, forecast.forecastday[1].hour);
        this.updateWeeklyForecast(forecast.forecastday);
        
        // Update astronomy
        this.updateAstronomy(astro);
        
        // Update alerts if any
        this.updateWeatherAlerts(this.forecastData.alerts);
        
        // Show weather content
        this.elements.weatherContent.classList.remove('d-none');
        this.elements.locationInput.value = `${location.name}, ${location.country}`;
    }

    /**
     * Update weather background based on conditions
     */
    updateWeatherBackground(condition, isDay) {
        // Remove existing weather classes
        const weatherClasses = ['sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm', 'mist', 'clear-night'];
        weatherClasses.forEach(cls => document.body.classList.remove(cls));

        const conditionLower = condition.toLowerCase();
        let weatherClass = 'sunny'; // default

        // Determine weather class
        for (const [className, conditions] of Object.entries(this.weatherConditions)) {
            if (conditions.some(cond => conditionLower.includes(cond))) {
                weatherClass = className;
                break;
            }
        }

        // Special case for night time
        if (!isDay && (weatherClass === 'sunny' || conditionLower.includes('clear'))) {
            weatherClass = 'clear-night';
        }

        document.body.classList.add(weatherClass);
        
        // Add weather particles animation
        this.addWeatherParticles(weatherClass);
    }

    /**
     * Add animated weather particles
     */
    addWeatherParticles(weatherType) {
        // Remove existing particles
        const existingParticles = document.querySelector('.weather-particles');
        if (existingParticles) {
            existingParticles.remove();
        }

        let particlesClass = '';
        switch (weatherType) {
            case 'rainy':
                particlesClass = 'rain-drops';
                break;
            case 'snowy':
                particlesClass = 'snow-flakes';
                break;
            case 'cloudy':
                particlesClass = 'floating-clouds';
                break;
            default:
                return; // No particles for other weather types
        }

        const particlesDiv = document.createElement('div');
        particlesDiv.className = `weather-particles ${particlesClass} active`;
        document.body.appendChild(particlesDiv);
    }

    /**
     * Update current weather display
     */
    updateCurrentWeather(current, location) {
        this.elements.currentLocation.textContent = location.name;
        this.elements.currentCountry.textContent = `${location.region}, ${location.country}`;
        this.elements.currentTemp.textContent = Math.round(current.temp_c);
        this.elements.currentCondition.textContent = current.condition.text;
        this.elements.feelsLike.textContent = Math.round(current.feelslike_c);
        this.elements.lastUpdated.textContent = new Date(current.last_updated).toLocaleTimeString();

        // Set weather icon
        this.elements.currentWeatherIcon.src = `https:${current.condition.icon}`;
        this.elements.currentWeatherIcon.alt = current.condition.text;
    }

    /**
     * Update weather details
     */
    updateWeatherDetails(current) {
        this.elements.humidity.textContent = `${current.humidity}%`;
        this.elements.windSpeed.textContent = `${current.wind_kph} km/h`;
        this.elements.windDirection.textContent = current.wind_dir;
        this.elements.pressure.textContent = `${current.pressure_mb} mb`;
        this.elements.visibility.textContent = `${current.vis_km} km`;
        
        // UV Index with category
        this.elements.uvIndex.textContent = current.uv;
        const uvCategory = this.getUVCategory(current.uv);
        this.elements.uvCategory.textContent = uvCategory.text;
        this.elements.uvCategory.className = `weather-detail-sub ${uvCategory.class}`;

        // Air Quality if available
        if (current.air_quality) {
            const aqi = Math.round(current.air_quality.pm2_5);
            this.elements.airQuality.textContent = aqi;
            const aqiLevel = this.getAQILevel(aqi);
            this.elements.airQualityLevel.textContent = aqiLevel.text;
            this.elements.airQualityLevel.className = `weather-detail-sub ${aqiLevel.class}`;
        }
    }

    /**
     * Update hourly forecast
     */
    updateHourlyForecast(todayHours, tomorrowHours) {
        const currentHour = new Date().getHours();
        const hours = [...todayHours.slice(currentHour), ...tomorrowHours.slice(0, Math.max(0, 24 - (24 - currentHour)))];
        
        const hourlyHtml = hours.slice(0, 24).map((hour, index) => {
            const time = new Date(hour.time);
            const isNow = index === 0;
            
            return `
                <div class="hourly-item ${isNow ? 'current-hour' : ''}">
                    <div class="hourly-time">${isNow ? 'Now' : time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                    <img src="https:${hour.condition.icon}" alt="${hour.condition.text}" class="hourly-icon">
                    <div class="hourly-temp">${Math.round(hour.temp_c)}°</div>
                    <div class="hourly-condition">${hour.condition.text}</div>
                    <div class="hourly-rain">
                        <i class="bi bi-droplet me-1"></i>${hour.chance_of_rain}%
                    </div>
                </div>
            `;
        }).join('');

        this.elements.hourlyForecast.innerHTML = hourlyHtml;
    }

    /**
     * Update weekly forecast
     */
    updateWeeklyForecast(forecastDays) {
        const weeklyHtml = forecastDays.map((day, index) => {
            const date = new Date(day.date);
            const dayName = index === 0 ? 'Today' : 
                           index === 1 ? 'Tomorrow' : 
                           date.toLocaleDateString([], {weekday: 'long'});

            return `
                <div class="daily-item">
                    <div class="daily-day">${dayName}</div>
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" class="daily-icon">
                    <div class="daily-condition">${day.day.condition.text}</div>
                    <div class="daily-temps">
                        <span class="daily-high">${Math.round(day.day.maxtemp_c)}°</span>
                        <span class="daily-low">${Math.round(day.day.mintemp_c)}°</span>
                    </div>
                    <div class="daily-rain">
                        <i class="bi bi-droplet me-1"></i>${day.day.daily_chance_of_rain}%
                    </div>
                </div>
            `;
        }).join('');

        this.elements.weeklyForecast.innerHTML = weeklyHtml;
    }

    /**
     * Update astronomy information
     */
    updateAstronomy(astro) {
        this.elements.sunrise.textContent = astro.sunrise;
        this.elements.sunset.textContent = astro.sunset;
        this.elements.moonrise.textContent = astro.moonrise;
        this.elements.moonset.textContent = astro.moonset;
        this.elements.moonPhase.textContent = astro.moon_phase;
        this.elements.moonIllumination.textContent = `${astro.moon_illumination}%`;

        // Calculate daylight hours
        const sunrise = new Date(`1970-01-01T${astro.sunrise}`);
        const sunset = new Date(`1970-01-01T${astro.sunset}`);
        const daylightMs = sunset - sunrise;
        const daylightHours = Math.floor(daylightMs / (1000 * 60 * 60));
        const daylightMinutes = Math.floor((daylightMs % (1000 * 60 * 60)) / (1000 * 60));
        
        this.elements.daylightHours.textContent = `${daylightHours}h ${daylightMinutes}m`;
    }

    /**
     * Update weather alerts
     */
    updateWeatherAlerts(alerts) {
        if (!alerts || !alerts.alert || alerts.alert.length === 0) {
            this.elements.weatherAlertsCard.classList.add('d-none');
            return;
        }

        const alertsHtml = alerts.alert.map(alert => `
            <div class="alert-item">
                <div class="alert-title">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${alert.headline}
                </div>
                <div class="alert-description">${alert.desc}</div>
                <div class="alert-time">
                    <small>${new Date(alert.effective).toLocaleString()} - ${new Date(alert.expires).toLocaleString()}</small>
                </div>
            </div>
        `).join('');

        this.elements.weatherAlerts.innerHTML = alertsHtml;
        this.elements.weatherAlertsCard.classList.remove('d-none');
    }

    /**
     * Update current time
     */
    updateCurrentTime() {
        if (this.currentLocation) {
            const now = new Date();
            const timeZone = this.currentLocation.tz_id;
            try {
                const localTime = now.toLocaleString('en-US', {
                    timeZone: timeZone,
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                this.elements.currentTime.textContent = localTime;
            } catch (error) {
                this.elements.currentTime.textContent = now.toLocaleString();
            }
        } else {
            this.elements.currentTime.textContent = new Date().toLocaleString();
        }
    }

    /**
     * Get UV category
     */
    getUVCategory(uvIndex) {
        if (uvIndex <= 2) return { text: 'Low', class: 'uv-low' };
        if (uvIndex <= 5) return { text: 'Moderate', class: 'uv-moderate' };
        if (uvIndex <= 7) return { text: 'High', class: 'uv-high' };
        if (uvIndex <= 10) return { text: 'Very High', class: 'uv-very-high' };
        return { text: 'Extreme', class: 'uv-extreme' };
    }

    /**
     * Get AQI level
     */
    getAQILevel(aqi) {
        if (aqi <= 50) return { text: 'Good', class: 'aqi-good' };
        if (aqi <= 100) return { text: 'Moderate', class: 'aqi-moderate' };
        if (aqi <= 150) return { text: 'Unhealthy for Sensitive', class: 'aqi-unhealthy-sensitive' };
        if (aqi <= 200) return { text: 'Unhealthy', class: 'aqi-unhealthy' };
        if (aqi <= 300) return { text: 'Very Unhealthy', class: 'aqi-very-unhealthy' };
        return { text: 'Hazardous', class: 'aqi-hazardous' };
    }

    /**
     * Recent searches management
     */
    addToRecentSearches(location) {
        // Remove if already exists
        const index = this.recentSearches.indexOf(location);
        if (index > -1) {
            this.recentSearches.splice(index, 1);
        }
        
        // Add to beginning
        this.recentSearches.unshift(location);
        
        // Limit size
        if (this.recentSearches.length > this.maxRecentSearches) {
            this.recentSearches = this.recentSearches.slice(0, this.maxRecentSearches);
        }
        
        this.saveRecentSearches();
    }

    loadRecentSearches() {
        try {
            const saved = localStorage.getItem('weatherRecentSearches');
            if (saved) {
                this.recentSearches = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading recent searches:', error);
            this.recentSearches = [];
        }
    }

    saveRecentSearches() {
        try {
            localStorage.setItem('weatherRecentSearches', JSON.stringify(this.recentSearches));
        } catch (error) {
            console.error('Error saving recent searches:', error);
        }
    }

    clearRecentSearches() {
        this.recentSearches = [];
        this.saveRecentSearches();
        if (this.elements.recentSearchesList) {
            this.elements.recentSearchesList.innerHTML = '<p class="text-muted text-center">No recent searches</p>';
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.elements.loadingState.classList.remove('d-none');
        this.elements.errorState.classList.add('d-none');
        this.elements.weatherContent.classList.add('d-none');
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.elements.loadingState.classList.add('d-none');
    }

    /**
     * Show error state
     */
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorState.classList.remove('d-none');
        this.elements.loadingState.classList.add('d-none');
        this.elements.weatherContent.classList.add('d-none');
    }
}

// Initialize the weather app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});

// Export for use in HTML onclick handlers
window.WeatherApp = WeatherApp;